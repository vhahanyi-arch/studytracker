// Verifies the unit every numeric physics practice answer carries (ANSWER_UNITS in
// lib/physics-question-engine.ts) and the unit-aware marker, over at least 3,000
// generated sets per tier for every IGCSE and AS unit.
//
// The oracle is each question's own worked solution: the unit written after the
// final answer (or, if the solution gives none, the unit the prompt asks for
// with "in ...") must be the unit in the table. Then, for every question:
// the bare number and the number with its unit are right, the number with a
// different unit or a different prefix is wrong, and a unitless answer refuses
// any unit. Run by `pnpm test:content`; see docs/physics-practice-units-verification.md.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let seed=6250625;
const math=Object.assign(Object.create(Math),{random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8');
const E={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const unitHelpers={readUnit,sameUnit,ANSWER_UNITS};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:E,Math:math});
const {readUnit,sameUnit,ANSWER_UNITS}=E.unitHelpers;
const matches=E.answerMatches;

const tiers=['foundational','application','reasoning'];
const units=[
  ...Array.from({length:21},(_,i)=>['igcse',`igcse-u${i+1}`]),
  ...Array.from({length:11},(_,i)=>['as',`as-u${i+1}`]),
].filter(([level,id])=>E.supportsPhysicsUnit(level,id));
const NUMBER=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const escape=text=>text.replace(/[.+*?^$()[\]{}|\\]/g,'\\$&');

// The longest run of up to four words that reads as a unit: "N m", "million km/year".
function statedUnit(rest) {
  const words=rest.split(/[;,(]|\.(?:\s|$)/)[0].trim().split(/\s+/).filter(Boolean);
  for(let k=Math.min(4,words.length);k>0;k--) {
    const text=words.slice(0,k).join(' ').replace(/[.,;:)]+$/,'');
    if(text && readUnit(text).length) return text;
  }
  return '';
}
// Reviewed by hand: the solution states no unit, so the prompt must name it.
const PROMPT_NAMES_UNIT={'igcse-u5-r2':'kg·m/s or N·s'};
function oracleUnit(q) {
  const answer=q.answers[0];
  if(PROMPT_NAMES_UNIT[q.templateId]) return q.prompt.includes(PROMPT_NAMES_UNIT[q.templateId]) ? PROMPT_NAMES_UNIT[q.templateId].split(' or ')[0] : '';
  let unit='';
  for(const m of q.solution.matchAll(new RegExp(String.raw`(?<![\d.])(R?)`+escape(answer)+String.raw`(?!\d|\.\d)`,'g'))) {
    if(m[1]) { unit='R'; continue; }
    const found=statedUnit(q.solution.slice(m.index+m[0].length));
    if(found) unit=found;
  }
  if(!unit) for(const m of q.prompt.matchAll(/\bin ([^.?,;]+)/g)) { const found=statedUnit(m[1]); if(found) unit=found; }
  return unit;
}

// The same unit written the other ways students write it.
function notations(unit) {
  const out=new Set([unit, unit.replace(/ /g,''), unit.toLowerCase()]);
  out.add(unit.replace(/\^2/g,'²').replace(/\^3/g,'³'));
  out.add(unit.replace(/²/g,'^2').replace(/³/g,'^3'));
  out.add(unit.replace(/·/g,' ')); out.add(unit.replace(/[· ]/g,'*')); out.add(unit.replace(/ /g,'·'));
  out.add(unit.replace(/Ω/g,'ohms')); out.add(unit.replace(/Ω/g,' ohm').trim());
  const per=/^(.+)\/([A-Za-z]+)(?:\^(\d)|([²³]))?$/.exec(unit);
  if(per) { const n=per[3]??(per[4]==='²'?'2':per[4]==='³'?'3':'1'); out.add(`${per[1]} ${per[2]}^-${n}`); out.add(`${per[1]} ${per[2]}⁻${n==='1'?'¹':n==='2'?'²':'³'}`); }
  return [...out].filter(text=>text && readUnit(text).length);
}
const WRONG=['m','cm','km','s','kg','g','N','J','kJ','W','Pa','V','A','Ω','Hz','C','K','°C','°','%','m/s','m/s²','N m','kg m/s','N/kg','kg/m³','m²','nm','counts/s','R'];
const EQUIVALENT={'kg·m/s':['N·s','N s'],'kg m/s':['N s'],'N·s':['kg m/s'],'N m':['J'],'N·m':['J'],'Ω':['V/A'],'Hz':['s^-1','1/s'].filter(t=>readUnit(t).length),'Pa':['N/m²'],'N/kg':['m/s²'],'J':['N m','W s']};

const perTemplate=new Map(), failed=new Map();
let sets=0, questions=0, numeric=0, checks=0;
// Grouped by template and reason, with the first example of each.
const fail=(q,why)=>{
  const key=`${q.templateId}: ${why}`;
  const seen=failed.get(key);
  if(seen) seen.count++;
  else failed.set(key,{count:1,example:`  P: ${q.prompt}\n  S: ${q.solution}\n  A: ${q.answers.join(' | ')} unit=${JSON.stringify(q.unit)}`});
};
const expect=(q,ok,why)=>{ checks++; if(!ok) fail(q,why); };

for(const [level,id] of units) for(const tier of tiers) for(let i=0;i<iterations;i++) {
  const set=E.makePhysicsQuestions(level,id,tier); sets++;
  for(const q of set) {
    questions++;
    const isNumeric=q.answers.every(a=>NUMBER.test(a.trim()));
    const seen=perTemplate.get(q.templateId)??{count:0,units:new Map()};
    perTemplate.set(q.templateId,seen); seen.count++;
    if(!isNumeric) { expect(q,q.unit===undefined,'a word or list answer has a unit'); continue; }
    numeric++;
    seen.units.set(q.unit,(seen.units.get(q.unit)||0)+1);
    if(q.unit===undefined) { expect(q,false,'numeric answer missing from ANSWER_UNITS'); continue; }
    const answer=q.answers[0];
    expect(q,matches(answer,q.answers,q.unit),'bare number refused');
    if(q.unit==='') {
      expect(q,oracleUnit(q)===''||q.templateId==='as-u9-r4','solution names a unit for a unitless answer');
      expect(q,!matches(`${answer} m`,q.answers,''),'unitless answer accepted a unit');
      continue;
    }
    const readings=readUnit(q.unit);
    expect(q,readings.length===1,`table unit ${q.unit} reads ${readings.length} ways`);
    const wanted=readings[0];
    const stated=oracleUnit(q);
    expect(q,!!stated && readUnit(stated).some(r=>sameUnit(r,wanted)),`solution states "${stated}", table says "${q.unit}"`);
    expect(q,matches(`${answer} ${q.unit}`,q.answers,q.unit),'number with its unit refused');
    expect(q,matches(`${answer}${q.unit}`,q.answers,q.unit),'number run into its unit refused');
    expect(q,matches(`${answer} ${q.unit}`,q.answers),'a session without units refused a real unit');
    // The full notation and wrong-unit matrix on the first instances of each template.
    if(seen.count>60) continue;
    for(const text of notations(q.unit)) expect(q,matches(`${answer} ${text}`,q.answers,q.unit),`notation "${text}" refused`);
    for(const text of EQUIVALENT[q.unit]??[]) expect(q,matches(`${answer} ${text}`,q.answers,q.unit),`equivalent "${text}" refused`);
    for(const text of [...WRONG, `k${q.unit}`, `m${q.unit}`, `M${q.unit}`]) {
      const options=readUnit(text);
      if(!options.length || options.some(r=>sameUnit(r,wanted))) continue;
      expect(q,!matches(`${answer} ${text}`,q.answers,q.unit),`wrong unit "${text}" accepted`);
    }
    expect(q,!matches(`${answer} bananas`,q.answers,q.unit),'nonsense after the number accepted');
    expect(q,!matches(`${answer}x`,q.answers,q.unit),'a variable taken for a unit');
    // Converting to another prefix is still a different answer in a different unit.
    if(/^(m|g|J|N|W|Pa|V|A|s)$/.test(q.unit) && Number(answer)!==0)
      expect(q,!matches(`${Number(answer)*1000} m${q.unit}`,q.answers,q.unit),`${answer} ${q.unit} written as milli-${q.unit} accepted`);
    if(Number(answer)!==0) expect(q,!matches(`${Number(answer)*1.01} ${q.unit}`,q.answers,q.unit),'1% off accepted');
  }
}

// Every template in the table must still exist and give numeric answers.
for(const id of Object.keys(ANSWER_UNITS)) if(!perTemplate.get(id)?.units.size) failed.set(`${id}: in ANSWER_UNITS but never generated with a numeric answer`,{count:1,example:''});
const failures=[...failed].map(([key,{count,example}])=>`${key} (×${count})\n${example}`);
const unitVaries=[...perTemplate].filter(([,t])=>t.units.size>1).map(([id,t])=>`${id}: ${[...t.units.keys()].join(', ')}`);

const report={iterationsPerTier:iterations,units:units.length,sets,questions,numericQuestions:numeric,checks,
  templatesWithUnits:[...perTemplate].filter(([,t])=>[...t.units.keys()].some(u=>u)).length,
  unitlessTemplates:[...perTemplate].filter(([,t])=>t.units.has('')).length,
  templatesWhoseUnitVaries:unitVaries,failures:failures.length};
console.log(JSON.stringify(report,null,2));
if(failures.length) { console.log(failures.join('\n')); process.exit(1); }
