import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u4.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020419;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u4',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='4').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(),seen=new Map(),cases=new Set(),failures=new Set();
let questions=0,decimals=0,balanceChecks=0;
const num='([+-]?\\d+(?:\\.\\d+)?)';
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Cannot parse: ${p}`);return m.slice(1).map(Number);};
const equal=(a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
function oracle(q){
  const p=q.prompt,answer=q.answers[0],opts=[...p.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)];
  if(opts.length){assert.equal(opts.length,4);assert.equal(new Set(opts.map(o=>o[2])).size,4);}
  const semantic=opts.find(o=>o[1]===answer)?.[2]??answer;
  const close=x=>equal(Number(answer),x,q.templateId);
  const pair=()=>{assert.match(answer,/^[+-]?\d+(?:\.\d+)?, [+-]?\d+(?:\.\d+)?$/);const v=answer.split(',').map(Number);assert.ok(!matcher(v.join(''),q.answers));assert.ok(!matcher('junk '+answer,q.answers));if(v[0]!==v[1])assert.ok(!matcher([...v].reverse().join(', '),q.answers));return v;};
  switch(q.templateId){
    case 'as-u4-f1':{const [x0,x1]=values(p,new RegExp(`x = ${num} cm to x = ${num} cm`));assert.ok(x1>x0);close((x0+x1)/2);assert.ok(Number(answer)>x0&&Number(answer)<x1);break;}
    case 'as-u4-f2':{const [f,d]=values(p,new RegExp(`force of ${num} N.*distance of ${num} m`));close(f*d);assert.ok(f>0&&d>0);break;}
    case 'as-u4-f3':{const separated=p.includes('different lines');assert.equal(answer,separated?'true':'false');cases.add(separated?'couple':'collinear pair');break;}
    case 'as-u4-f4':{const [f,d]=values(p,new RegExp(`each ${num} N.*is ${num} cm`));close(f*d/100);assert.ok(f>0&&d>0);break;}
    case 'as-u4-f5':{const [m,v]=values(p,new RegExp(`mass ${num} g and volume ${num} cm`));close(m/v);assert.ok(m>0&&v>0);break;}
    case 'as-u4-f6':{const [f,a]=values(p,new RegExp(`force of ${num} N.*area of ${num} m`));close(f/a);assert.ok(f>0&&a>0);break;}
    case 'as-u4-a1':{const [f,l,d]=values(p,new RegExp(`force of ${num} N acts ${num} m.*act ${num} m to the right`));close(f*l/d);equal(Number(answer)*d,f*l,'moments');assert.ok(Number(answer)>0);balanceChecks++;break;}
    case 'as-u4-a2':{const force=p.includes('has nonzero resultant force'),torque=p.includes('and nonzero resultant torque');const index=(force?1:0)+(torque?2:0);assert.equal(semantic,['neither linear nor angular acceleration: equilibrium','linear acceleration only','angular acceleration only','both linear and angular acceleration'][index]);cases.add('equilibrium case '+index);break;}
    case 'as-u4-a3':{const [east,north]=values(p,new RegExp(`forces are ${num} N east and ${num} N north`));const [x,y]=pair();equal(east+x,0);equal(north+y,0);assert.ok(x<0&&y<0);balanceChecks++;break;}
    case 'as-u4-a4':{const force=p.includes('that force difference');assert.equal(semantic,force?'ρAgΔh':'ρgΔh');cases.add(force?'derive force':'derive pressure');break;}
    case 'as-u4-a5':{const [rho,h0,h1]=values(p,new RegExp(`density ${num} kg/m\\^3.*points are ${num} m and ${num} m`));close(rho*10*(h1-h0));assert.ok(rho>0&&h0>=0&&h1>h0);break;}
    case 'as-u4-a6':{const [area,top,bottom]=values(p,new RegExp(`area ${num} cm\\^2.*pressure is ${num} Pa at the top and ${num} Pa`));close((bottom-top)*area*1e-4);assert.ok(area>0&&bottom>top&&Number(answer)>0);break;}
    case 'as-u4-r1':{const [l,w,pLoad,x]=values(p,new RegExp(`length ${num} m and weight ${num} N.*load of ${num} N acts ${num} m`));const [a,b]=pair();equal(a+b,w+pLoad,'vertical balance');equal(b*l,w*l/2+pLoad*x,'moment balance left');equal(a*l,w*l/2+pLoad*(l-x),'moment balance right');assert.ok(a>0&&b>0&&x>0&&x<l);balanceChecks++;break;}
    case 'as-u4-r2':{const [l,f]=values(p,new RegExp(`extends ${num} m.*A ${num} N force`));const up=p.includes('30° above');close((up?1:-1)*l*f*Math.sin(Math.PI/6));cases.add(up?'angled anticlockwise':'angled clockwise');break;}
    case 'as-u4-r3':{const [f,x1,x2]=values(p,new RegExp(`magnitude ${num} N.*x = ${num} m.*x = ${num} m`));const up=p.includes('x = 1 m acts upwards');const first=up?f:-f;close(first*x1-first*x2);equal(first-first,0);assert.ok(x2>x1);cases.add(up?'couple clockwise':'couple anticlockwise');balanceChecks++;break;}
    case 'as-u4-r4':{const [w]=values(p,new RegExp(`load of ${num} N`));const [h,t]=pair();equal(t*0.6,w,'vertical cable balance');equal(t*0.8,h,'horizontal cable balance');equal(h*h+w*w,t*t,'closed force triangle');assert.ok(h>0&&t>0);balanceChecks++;break;}
    case 'as-u4-r5':{const [v,percent,rho]=values(p,new RegExp(`volume ${num} cm\\^3.*with ${num}%.*density ${num} kg/m\\^3`));const immersed=v*percent/100;close(rho*10*immersed*1e-6);assert.ok(immersed>0&&immersed<v&&rho>0);assert.ok(Number(answer)>0&&Number(answer)<rho*10*v*1e-6);cases.add('immersion '+percent);break;}
    case 'as-u4-r6':{const [m,v,rho]=values(p,new RegExp(`mass ${num} kg and volume ${num} cm\\^3.*density ${num} kg/m\\^3`));const buoyancy=rho*10*v*1e-6;close(m*10-buoyancy);equal(Number(answer)+buoyancy,m*10,'suspension balance');assert.ok(m/(v*1e-6)>rho&&Number(answer)>0&&Number(answer)<m*10);balanceChecks++;break;}
    default:assert.fail(q.templateId);
  }
  if(opts.length)for(const option of opts)if(option[1]!==answer)assert.ok(!matcher(option[1],q.answers));
  if(/^-?\d+(?:\.\d+)?$/.test(answer)){const wrong=Number(answer)+Math.max(1,Math.abs(Number(answer))*.01);assert.ok(!matcher(String(wrong),q.answers));}
  return semantic;
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
for(const [id,s]of seen)assert.ok(s.answers.size>1,id+': fake randomization');
for(const c of ['couple','collinear pair','equilibrium case 0','equilibrium case 1','equilibrium case 2','equilibrium case 3','derive force','derive pressure','angled anticlockwise','angled clockwise','couple clockwise','couple anticlockwise','immersion 25','immersion 50','immersion 75'])if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u4.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);
let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,balanceChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u4'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u4"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
