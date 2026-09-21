import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u10.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97021021;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u10',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='10').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(),seen=new Map(),cases=new Set(),failures=new Set();
let questions=0,decimals=0,electricalChecks=0,algebraChecks=0;
const num='([+-]?\\d+(?:\\.\\d+)?)';
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Cannot parse: ${p}`);return m.slice(1).map(Number);};
const equal=(a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
function oracle(q){
 const p=q.prompt,id=q.templateId.split('-').at(-1),n=[...p.split(' (a)')[0].matchAll(/[+-]?\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
 const option=q.answers[0].length===1?p.match(new RegExp('\\('+q.answers[0]+'\\) (.*?)(?= \\([a-d]\\) |$)'))?.[1]:null;
 let expected;
 switch(id){
 case 'f1': {
 const names=['cell','battery of cells','power supply','a.c. power supply','junction of conductors','lamp','fixed resistor','variable resistor','thermistor','light-dependent resistor','heater','switch','earth','electric bell','buzzer','microphone','loudspeaker','motor','generator','ammeter','voltmeter','galvanometer','potentiometer','diode','light-emitting diode','oscilloscope','capacitor'];
 const clues=['one long and one short','several alternating','no alternating-wave','with an alternating-wave','filled dot','containing a cross','plain rectangle','diagonal arrow','short bent end','arrows pointing towards','narrow vertical sections','movable contact','bars of decreasing','upward dome','semicircular bowl','touching a vertical line','flared cone','underlined M','containing G','containing A','containing V','pointer arrow','slider arrow','triangle pointing','arrows pointing away','rising-and-falling','two equal parallel'];
 const stem=p.split('?')[0],i=clues.findIndex(c=>stem.includes(c));assert.ok(i>=0);assert.equal(clues.filter(c=>stem.includes(c)).length,1);expected=names[i];cases.add('symbol '+i);break;}
 case 'f2': {const a=p.includes('ideal ammeter');cases.add(a?'ammeter':'voltmeter');expected=a?'insert the meter in series in the branch containing R':'connect the meter directly between P and Q in parallel with R';break;}
 case 'f3':expected=n[0]/n[1];break;
 case 'f4':expected=p.includes('mechanical force')?'false':'true';cases.add('emf '+expected);assert.equal(q.answers[0],expected);return expected;
 case 'f5':expected=n[0]-n[1];equal(n[0],n[1]+Number(q.answers[0]));electricalChecks++;break;
 case 'f6':expected=n[0]-n[1];electricalChecks++;break;
 case 'a1': {const [e,r,R]=n,I=e/(r+R);expected=e-I*r;equal(expected,I*R);equal(e*I,I*I*r+expected*I);electricalChecks+=2;break;}
 case 'a2': {const three=p.includes('three series');expected=three?'R1 + R2 + R3':'R1 + R2';cases.add(three?'series three':'series two');for(const I of [2,5])equal((I*3+I*7+(three?I*11:0))/I,three?21:10);algebraChecks+=2;break;}
 case 'a3':expected=n.reduce((a,b)=>a+b,0);break;
 case 'a4': {const reciprocal=p.includes('equals 1/R_total');expected=reciprocal?'1/R1 + 1/R2':'R1R2/(R1 + R2)';cases.add(reciprocal?'parallel reciprocal':'parallel resistance');for(const V of [2,5]){const total=V/3+V/7;equal(V/total,21/10);}algebraChecks+=2;break;}
 case 'a5':expected=1/(1/n[0]+1/n[1]);assert.ok(expected<Math.min(...n));electricalChecks++;break;
 case 'a6': {const [a,v,b]=n;expected=v/(a+b)*b;assert.ok(expected>0&&expected<v);electricalChecks++;break;}
 case 'r1': {const [e,s,a,b]=n,total=e/(s+1/(1/a+1/b)),vp=e-total*s;expected=vp/a;equal(total,expected+vp/b);assert.notEqual(expected,total);electricalChecks+=2;break;}
 case 'r2': {const [e,I,v]=n;expected=(e-v)/I;assert.ok(e>v&&expected>0);assert.notEqual(v/I,expected,'misconception accidentally produces the correct answer');equal(e,I*expected+v);electricalChecks+=2;break;}
 case 'r3':expected=n[0]*n[2]/n[1];equal(expected/(n[2]/100),n[0]/(n[1]/100));electricalChecks++;break;
 case 'r4': {const current=p.includes('current statement');cases.add(current?'null current':'null voltage');expected=current?'the galvanometer comparison branch carries zero current while the driver wire can still carry current':'the cell voltage equals the p.d. across the selected balance length';break;}
 case 'r5': {const sensor=p.includes('(LDR)')?'LDR':'NTC',up=p.includes('is increased'),upper=p.includes('as the upper'),before=2,after=up?1:4,fixed=3;
 const voltage=R=>upper?12*fixed/(R+fixed):12*R/(R+fixed);expected='sensor resistance '+(after<before?'decreases':'increases')+' and output '+(voltage(after)>voltage(before)?'rises':'falls');cases.add(sensor+' '+(up?'up':'down')+' '+(upper?'upper':'lower'));electricalChecks++;break;}
 case 'r6': {const [v,upper]=n;expected=v/(upper+0.5)*0.5;const input=(v-expected)/upper;equal(input,2*expected);equal(v*input,input*input*upper+2*expected*expected);assert.notEqual(expected,v/(upper+1));electricalChecks+=3;break;}
 default:throw Error('Unknown template '+id);
 }
 if(typeof expected==='number'){equal(Number(q.answers[0]),expected,id);assert.ok(expected>0);return String(expected);}
 assert.equal(option,expected,id);return expected;
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
for(const c of ['ammeter','voltmeter','emf true','emf false','series two','series three','parallel reciprocal','parallel resistance','null current','null voltage',...Array.from({length:27},(_,i)=>'symbol '+i),...['LDR','NTC'].flatMap(s=>['up','down'].flatMap(d=>['upper','lower'].map(p=>s+' '+d+' '+p)))])if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u10.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,electricalChecks,algebraChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u10'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u10"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u10999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
