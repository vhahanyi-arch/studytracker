import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u11.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97021121;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u11',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='11').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(),seen=new Map(),cases=new Set(),failures=new Set();
let questions=0,decimals=0,conservationChecks=0,quarkChargeChecks=0;
const num='([+-]?\\d+(?:\\.\\d+)?)';
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Cannot parse: ${p}`);return m.slice(1).map(Number);};
const equal=(a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
const decayReference=new Map([
 ['238,92,U',[234,90,'Th','alpha']],['226,88,Ra',[222,86,'Rn','alpha']],['210,84,Po',[206,82,'Pb','alpha']],
 ['14,6,C',[14,7,'N','beta-minus']],['3,1,H',[3,2,'He','beta-minus']],['90,38,Sr',[90,39,'Y','beta-minus']],
 ['11,6,C',[11,5,'B','beta-plus']],['13,7,N',[13,6,'C','beta-plus']],['18,9,F',[18,8,'O','beta-plus']]
]);
function oracle(q){
 const p=q.prompt,id=q.templateId.split('-').at(-1),stem=p.split(' (a)')[0];
 const opts=[...p.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)].map(m=>m[2]);
 const option=opts.length?opts[q.answers[0].charCodeAt(0)-97]:undefined;
 if(opts.length){assert.equal(opts.length,4);assert.equal(new Set(opts).size,4);for(let i=0;i<4;i++)assert.equal(matcher(String.fromCharCode(97+i),q.answers),String.fromCharCode(97+i)===q.answers[0]);}
 const index=Number(id.slice(1))-1,group=id[0];assert.equal(q.objective,group==='f'?'11.1.'+(index+1):group==='a'?'11.1.'+(index+7):'11.2.'+(index+1));
 let expected;
 switch(id){
 case 'f1': {const rare=stem.includes('very small fraction');expected=rare?'positive charge and most atomic mass are concentrated in a small nucleus':'the atom is mostly empty space';cases.add(rare?'scatter rare':'scatter most');break;}
 case 'f2': {const kind=stem.match(/applies to (a proton|a neutron|an electron)/)[1];expected={'a proton':'positive charge, located in the nucleus','a neutron':'zero charge, located in the nucleus','an electron':'negative charge, outside the nucleus'}[kind];cases.add(kind);break;}
 case 'f3': {const [Z,N]=values(stem,/(\d+) protons and (\d+) neutrons/);assert.ok([[3,4],[6,6],[6,7],[8,8],[8,10],[10,10],[12,12],[14,14],[18,22],[20,20],[20,24]].some(a=>a[0]===Z&&a[1]===N));const protons=stem.includes('proton number');expected=protons?Z:Z+N;cases.add(protons?'count Z':'count A');break;}
 case 'f4':expected=stem.includes('same proton number')?'true':'false';cases.add('isotope '+expected);break;
 case 'f5': {const m=stem.match(/a (\w+) nucleus with (\d+) protons and (\d+) neutrons/);assert.ok(m);assert.equal({C:6,O:8,Ne:10,Mg:12}[m[1]],Number(m[2]));expected='^'+(Number(m[2])+Number(m[3]))+'_'+m[2]+' '+m[1];cases.add('notation '+m[1]);break;}
 case 'f6': {const m=stem.match(/\^(\d+)_(\d+) (\w+) -> \^(\d+)_(\d+) (\w+)/);assert.ok(m);const key=m.slice(1,4).join(','),ref=decayReference.get(key);assert.ok(ref);assert.deepEqual([Number(m[4]),Number(m[5]),m[6]],ref.slice(0,3));expected=Number(m[2])-Number(m[5]);assert.equal(Number(m[1])-Number(m[4]),ref[3]==='alpha'?4:0);cases.add('charge '+key);conservationChecks+=2;break;}
 case 'a1': {const mode=stem.match(/identifies (alpha|beta-minus|beta-plus|gamma) radiation/)[1];expected={alpha:'helium-4 nucleus; mass approximately 4 u; charge +2e','beta-minus':'electron; rest mass m_e; charge -e','beta-plus':'positron; rest mass m_e; charge +e',gamma:'photon; zero rest mass; zero charge'}[mode];cases.add('radiation '+mode);break;}
 case 'a2':expected=stem.includes('negative rest mass')?'false':'true';cases.add('antiparticle '+expected);break;
 case 'a3': {const minus=stem.includes('beta-minus');expected=minus?'electron antineutrino':'electron neutrino';assert.ok(stem.includes(minus?'emitted electron':'emitted positron'));cases.add('neutral '+(minus?'minus':'plus'));break;}
 case 'a4': {const alpha=stem.includes('alpha-particle energies');expected=alpha?'each alpha transition to a specified daughter state has a fixed energy release shared in a fixed way with daughter recoil':'the beta-decay energy is shared variably with an emitted neutrino or antineutrino and daughter recoil';cases.add(alpha?'energy alpha':'energy beta');break;}
 case 'a5': {const m=stem.match(/\^(\d+)_(\d+) (\w+) undergoes (alpha|beta-minus|beta-plus) decay to (\w+)/);assert.ok(m);const key=m.slice(1,4).join(','),ref=decayReference.get(key);assert.ok(ref);assert.equal(ref[2],m[5]);assert.equal(ref[3],m[4]);const emission={alpha:'^4_2 alpha','beta-minus':'^0_-1 e + electron antineutrino','beta-plus':'^0_+1 e + electron neutrino'}[m[4]];expected='^'+ref[0]+'_'+ref[1]+' '+ref[2]+' + '+emission;
 const balanced=opts.filter(o=>{const nums=[...o.matchAll(/\^([+-]?\d+)_([+-]?\d+)/g)].map(v=>v.slice(1).map(Number));return nums.reduce((s,a)=>s+a[0],0)===Number(m[1])&&nums.reduce((s,a)=>s+a[1],0)===Number(m[2]);});assert.deepEqual(balanced,[expected]);conservationChecks+=2;cases.add('equation '+key);break;}
 case 'a6': {const [mass]=values(stem,/mass (\d+) u/);expected=mass*166/100;assert.ok(mass>0);assert.ok(matcher(String(expected*1.0005),q.answers));assert.ok(!matcher(String(expected*1.01),q.answers));cases.add('mass '+mass);break;}
 case 'r1': {const listed=stem.match(/lists (.+) and proton as/)[1].split(', '),missing=['up','down','strange','charm','top','bottom'].filter(f=>!listed.includes(f));assert.equal(missing.length,1);expected='replace proton with '+missing[0];cases.add('flavour '+missing[0]);break;}
 case 'r2': {const f=stem.match(/the (up|down|strange|charm|top|bottom) quark/)[1],anti=stem.includes('antiquark corresponding');expected={up:2,down:-1,strange:-1,charm:2,top:2,bottom:-1}[f];if(anti)expected=-expected;cases.add('quark '+f+' '+anti);quarkChargeChecks++;break;}
 case 'r3': {const proton=stem.includes('calls a proton');expected=proton?'uud; it is composite':'udd; it is composite';const total=[...expected.split(';')[0]].reduce((s,c)=>s+(c==='u'?2:-1),0);equal(total,proton?3:0);quarkChargeChecks++;cases.add(proton?'nucleon proton':'nucleon neutron');break;}
 case 'r4': {const baryon=stem.includes('two up quarks');expected=baryon?'baryon, because it consists of three quarks':'meson, because it consists of one quark and one antiquark';cases.add(baryon?'hadron baryon':'hadron meson');break;}
 case 'r5': {const minus=stem.includes('beta-minus');expected=minus?'one down quark becomes an up quark':'one up quark becomes a down quark';const before=minus?-1:2,after=minus?2:-1,beta=minus?-3:3;equal(before,after+beta);quarkChargeChecks++;cases.add(minus?'transition minus':'transition plus');break;}
 case 'r6': {const neutrino=stem.includes('classifies the electron neutrino');expected=(neutrino?'the electron neutrino':'the electron')+' is a fundamental lepton, not a quark composite';cases.add(neutrino?'lepton neutrino':'lepton electron');break;}
 default:throw Error('Unknown template '+id);
 }
 if(typeof expected==='number'){equal(Number(q.answers[0]),expected,id);return String(expected);}
 assert.equal(opts.length?option:q.answers[0],expected,id);return expected;
}
for(const tier of ['foundational','application','reasoning'])for(let i=0;i<iterations;i++){
  const qs=generate(tier);assert.equal(qs.length,6);assert.equal(new Set(qs.map(q=>q.prompt)).size,6);
  for(const q of qs){questions++;assert.equal(q.difficulty,tier);assert.ok(objectiveIds.includes(q.objective));coverage.add(q.objective);assert.ok(q.templateId&&q.hint&&q.solution&&q.answerFormat&&q.answers.length);
    for(const a of q.answers)assert.ok(matcher(a,q.answers));
    if(/\d+\.\d{5,}/.test([q.prompt,q.hint,q.solution,...q.answers].join(' '))){decimals++;failures.add(q.templateId+': ugly decimal');}
    assert.ok(!/NaN|Infinity|undefined/.test(JSON.stringify(q)));
    try{const semantic=oracle(q);if(!seen.has(q.templateId))seen.set(q.templateId,{prompts:new Set(),answers:new Set()});seen.get(q.templateId).prompts.add(q.prompt);seen.get(q.templateId).answers.add(semantic);}catch(error){failures.add(q.templateId+': '+error.message);}
  }
}
assert.deepEqual([...coverage].sort(),objectiveIds.sort());
for(const [id,s]of seen)if(s.answers.size<2)failures.add(id+': insufficient semantic variation');
const requiredCases=['scatter rare','scatter most','a proton','a neutron','an electron','count Z','count A','isotope true','isotope false',...['C','O','Ne','Mg'].map(x=>'notation '+x),...decayReference.keys().map(x=>'charge '+x),...['alpha','beta-minus','beta-plus','gamma'].map(x=>'radiation '+x),'antiparticle true','antiparticle false','neutral minus','neutral plus','energy alpha','energy beta',...decayReference.keys().map(x=>'equation '+x),...Array.from({length:19},(_,i)=>'mass '+(i+2)),...['up','down','strange','charm','top','bottom'].flatMap(x=>['flavour '+x,'quark '+x+' true','quark '+x+' false']),'nucleon proton','nucleon neutron','hadron baryon','hadron meson','transition minus','transition plus','lepton neutrino','lepton electron'];
for(const c of requiredCases)if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u11.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,requiredCases:requiredCases.length,observedCases:cases.size,uglyDecimals:decimals,conservationChecks,quarkChargeChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u11'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u11"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u11999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
