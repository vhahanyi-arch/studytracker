import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u8.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020820;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u8',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='8').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(),seen=new Map(),cases=new Set(),failures=new Set();
let questions=0,decimals=0,waveChecks=0,algebraChecks=0;
const num='([+-]?\\d+(?:\\.\\d+)?)';
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Cannot parse: ${p}`);return m.slice(1).map(Number);};
const equal=(a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
function oracle(q){
  const p=q.prompt,answer=q.answers[0],opts=[...p.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)];
  if(opts.length){assert.equal(opts.length,4);assert.equal(new Set(opts.map(o=>o[2])).size,4);}
  const semantic=opts.find(o=>o[1]===answer)?.[2]??answer,close=x=>equal(Number(answer),x,q.templateId);
  switch(q.templateId){
    case 'as-u8-f1':{const [a,b]=values(p,new RegExp(`of ${num} mm and ${num} mm`));close(a+b);cases.add(a+b>0?'sum positive':a+b<0?'sum negative':'sum zero');waveChecks++;break;}
    case 'as-u8-f2':{const node=p.includes('remains zero');assert.equal(semantic,node?'a node':'an antinode');cases.add(node?'node':'antinode');break;}
    case 'as-u8-f3':{const [d]=values(p,new RegExp(`is ${num} cm`));const nodes=p.includes('next node');close(d*(nodes?2:4));assert.ok(d>0);cases.add(nodes?'node-node':'node-antinode');waveChecks++;break;}
    case 'as-u8-f4':{const gap=p.includes('narrow gap');assert.equal(semantic,gap?'diffraction':'interference');cases.add(semantic);break;}
    case 'as-u8-f5':{const coherent=p.includes('remains constant');assert.equal(answer,coherent?'true':'false');cases.add('coherent '+coherent);break;}
    case 'as-u8-f6':{const [density]=values(p,new RegExp(`has ${num} equally`));close(1/(density*1000)*1e6);assert.ok(density>0);waveChecks++;break;}
    case 'as-u8-a1':{
      const microwave=p.includes('using microwaves'),string=p.includes('using a stretched string');
      assert.equal(semantic,microwave?'reflect a transmitted beam from a metal sheet and move a detector to locate alternating maxima and minima':string?'drive one end periodically and adjust frequency until fixed nodes and large oscillating loops form':'vary the length of a tube closed at one end while a fixed-frequency sound source drives it, finding resonances');
      cases.add(microwave?'stationary microwaves':string?'stationary string':'stationary air');break;
    }
    case 'as-u8-a2':{const narrow=p.includes('from ten');assert.equal(semantic,narrow?'spreading becomes more pronounced':'spreading becomes less pronounced');cases.add(narrow?'narrow gap':'wide gap');break;}
    case 'as-u8-a3':{
      const experiments=[['water waves','drive two ripple-tank dippers from the same vibrator','water'],['sound','drive two loudspeakers from the same signal generator and move a microphone across their overlap region','sound'],['light','illuminate two narrow slits with one coherent monochromatic source and observe the overlapping light on a screen','light'],['microwaves','illuminate two apertures from one transmitter and scan their overlapping beams with a receiver','microwaves']];
      const exp=experiments.find(([name])=>p.includes('interference with '+name+'?'));assert.ok(exp);assert.equal(semantic,exp[1]);cases.add('two-source '+exp[2]);break;
    }
    case 'as-u8-a4':{const [a,d,x]=values(p,new RegExp(`separation is ${num} mm.*distance is ${num} m.*are ${num} mm apart`));close((a*.001)*(x*.001)/d*1e9);assert.ok(d/(a*.001)>=1000&&x*.001/d<.01);assert.ok(Number(answer)>=400&&Number(answer)<=700);waveChecks++;break;}
    case 'as-u8-a5':{const [d,n,angle]=values(p,new RegExp(`spacing ${num} nm.*n = ${num} maximum is at ${num}°`));close(d*Math.sin(angle*Math.PI/180)/n);assert.ok(n>=1&&Number(answer)>=400&&Number(answer)<=700);equal(n*Number(answer)/d,.5);waveChecks++;break;}
    case 'as-u8-a6':{const angle=p.includes('angular separation between');assert.equal(semantic,angle?'half the measured angular separation':'the order n of the measured maximum, with the central maximum as n = 0');cases.add(angle?'angle half':'identify order');break;}
    case 'as-u8-r1':{const stable=p.includes('fixed relative phase');assert.equal(semantic,stable?'a stable pattern can form, but its minima need not be completely dark':'no stable fringe pattern is resolved because the changing relative phase washes it out');cases.add(stable?'stable':'unstable');break;}
    case 'as-u8-r2':{
      const [amplitude]=values(p,new RegExp(`amplitude ${num} mm`));
      const rows=[...p.matchAll(/At point ([PQ]), .*?are ([^.]+)\./g)];assert.equal(rows.length,2);
      const type={};
      for(const row of rows){const pairs=[...row[2].matchAll(/\((-?\d+), (-?\d+)\)/g)];assert.equal(pairs.length,4);
        const sum=pairs.map(m=>Number(m[1])+Number(m[2]));
        assert.ok(pairs.every(m=>Math.abs(Number(m[1]))<=amplitude&&Math.abs(Number(m[2]))<=amplitude));
        type[row[1]]=sum.every(v=>v===0)?'node':'antinode';
        if(type[row[1]]==='antinode'){equal(Math.max(...sum),2*amplitude);equal(Math.min(...sum),-2*amplitude);}
      }
      assert.notEqual(type.P,type.Q);assert.equal(semantic,type.P==='node'?'P is a node and Q is an antinode':'Q is a node and P is an antinode');cases.add(type.P==='node'?'P node':'Q node');algebraChecks++;break;
    }
    case 'as-u8-r3':{const [d,a,count,span]=values(p,new RegExp(`screen is ${num} m.*by ${num} mm.*last of ${num} consecutive.*is ${num} mm`));const x=span/(count-1);close(a*x/d*1000);assert.ok(count>=3&&x>0&&x*.001/d<.01);assert.ok(!matcher(String(a*span/count/d*1000),q.answers));waveChecks++;break;}
    case 'as-u8-r4':{
      const [lambda,d]=values(p,new RegExp(`wavelength ${num} nm.*spacing ${num} nm`));
      // Enumerate physically allowed signed orders instead of copying floor(d/lambda).
      const orders=Array.from({length:21},(_,i)=>i-10).filter(n=>Math.abs(n*lambda/d)<=1);
      const total=p.includes('total number');close(total?orders.length:Math.max(...orders));
      assert.ok(d>lambda&&d/lambda<10&&!Number.isInteger(d/lambda));
      for(const n of orders)assert.ok(Math.abs(n*lambda/d)<1);cases.add(total?'all maxima':'largest order');algebraChecks++;break;
    }
    case 'as-u8-r5':{const [lambda,delta]=values(p,new RegExp(`wavelength ${num} cm.*difference ${num} cm`));const relativePhase=2*Math.PI*delta/lambda;const magnitude=Math.sqrt(Math.max(0,2+2*Math.cos(relativePhase)));const destructive=magnitude<1e-7;assert.equal(semantic,destructive?'destructive interference with zero resultant amplitude':'constructive interference with maximum resultant amplitude');equal(magnitude,destructive?0:2);cases.add(destructive?'destructive':'constructive');waveChecks++;break;}
    case 'as-u8-r6':{const [f,l1,l2]=values(p,new RegExp(`frequency ${num} Hz.*are ${num} cm and ${num} cm`));const lambda=2*(l2-l1)*.01;close(f*lambda);equal(l1*.01,lambda/4);equal(l2*.01,3*lambda/4);assert.ok(Number(answer)>=320&&Number(answer)<=360&&f>0);assert.ok(!matcher(String(f*(l2-l1)*.01),q.answers));waveChecks++;break;}
    default:assert.fail(q.templateId);
  }
  if(opts.length)for(const o of opts)if(o[1]!==answer)assert.ok(!matcher(o[1],q.answers));
  if(/^-?\d+(?:\.\d+)?$/.test(answer)){
    const value=Number(answer);assert.ok(!matcher(String(value===0?.001:value*1.01),q.answers));
    assert.ok(matcher(String(value*1.0005),q.answers));
  }
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
for(const [id,s]of seen)if(s.answers.size<2)failures.add(id+': insufficient semantic variation');
for(const c of ['sum positive','sum negative','sum zero','node','antinode','node-node','node-antinode','diffraction','interference','coherent true','coherent false','stationary microwaves','stationary string','stationary air','narrow gap','wide gap','two-source water','two-source sound','two-source light','two-source microwaves','angle half','identify order','stable','unstable','P node','Q node','all maxima','largest order','constructive','destructive'])if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u8.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,waveChecks,algebraChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u8'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u8"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
