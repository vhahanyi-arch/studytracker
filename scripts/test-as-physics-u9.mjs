import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u9.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020921;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u9',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='9').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(),seen=new Map(),cases=new Set(),failures=new Set();
let questions=0,decimals=0,electricalChecks=0,algebraChecks=0;
const num='([+-]?\\d+(?:\\.\\d+)?)';
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Cannot parse: ${p}`);return m.slice(1).map(Number);};
const equal=(a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
function oracle(q){
  const p=q.prompt,answer=q.answers[0],opts=[...p.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)];
  if(opts.length){assert.equal(opts.length,4);assert.equal(new Set(opts.map(o=>o[2])).size,4);}
  const semantic=opts.find(o=>o[1]===answer)?.[2]??answer,close=x=>equal(Number(answer),x,q.templateId);
  switch(q.templateId){
    case 'as-u9-f1':{const metal=p.includes('a metal wire');assert.equal(semantic,metal?'conduction electrons':'positive and negative ions');cases.add(metal?'metal':'electrolyte');break;}
    case 'as-u9-f2':{const [coefficient]=values(p,new RegExp(`magnitude ${num} × 10\\^-19 C`));close(coefficient/1.6);assert.ok(Number.isInteger(Number(answer))&&Number(answer)>0);electricalChecks++;break;}
    case 'as-u9-f3':{const [current,time]=values(p,new RegExp(`of ${num} A.*for ${num} s`));close(current*time);assert.ok(current>0&&time>0);electricalChecks++;break;}
    case 'as-u9-f4':{const [perCharge,charge]=values(p,new RegExp(`transfers ${num} J.*when ${num} C passes`));close(perCharge*charge);assert.ok(perCharge>0&&charge>0);electricalChecks++;break;}
    case 'as-u9-f5':{const [voltage,current]=values(p,new RegExp(`difference ${num} V and current ${num} A`));close(voltage/current);assert.ok(voltage>0&&current>0);electricalChecks++;break;}
    case 'as-u9-f6':{const valid=p.includes('provided temperature');assert.equal(answer,valid?'true':'false');cases.add('Ohm '+valid);break;}
    case 'as-u9-a1':{
      const [area,n,v,q]=values(p,new RegExp(`area ${num} mm\\^2.*density ${num} × 10\\^28.*speed ${num} × 10\\^-4.*magnitude ${num} × 10\\^-19`));
      // Count carriers crossing a section in one second, then charge per carrier.
      const sweptVolume=area*1e-6*v*1e-4,carriers=sweptVolume*n*1e28;close(carriers*q*1e-19);
      assert.ok(area>0&&n>0&&v>0&&q>0&&v*1e-4<.01);electricalChecks++;break;
    }
    case 'as-u9-a2':{const [work,charge]=values(p,new RegExp(`transfers ${num} J.*while ${num} C`));close(work/charge);assert.ok(work>0&&charge>0);electricalChecks++;break;}
    case 'as-u9-a3':{
      let voltage,current;
      if(p.includes(' V and current')){[voltage,current]=values(p,new RegExp(`difference ${num} V and current ${num} A`));cases.add('power VI');}
      else if(p.includes('with current')){const [i,resistance]=values(p,new RegExp(`current ${num} A and resistance ${num} ohms`));current=i;voltage=i*resistance;cases.add('power I2R');}
      else {const [v,resistance]=values(p,new RegExp(`difference ${num} V and resistance ${num} ohms`));voltage=v;current=v/resistance;cases.add('power V2R');}
      // Charge per second times joules per coulomb gives power for every form.
      close(voltage*current);assert.ok(voltage>0&&current>0);electricalChecks++;break;
    }
    case 'as-u9-a4':{const [milliamps,resistance]=values(p,new RegExp(`of ${num} mA.*a ${num} ohm`));close(milliamps*.001*resistance);assert.ok(milliamps>0&&resistance>0);electricalChecks++;break;}
    case 'as-u9-a5':{
      const metal=p.includes('metallic conductor'),lamp=p.includes('a filament lamp');
      assert.equal(semantic,metal?'a straight line through the origin with constant positive gradient':lamp?'a curve through the origin in both polarities that becomes less steep at larger voltage magnitudes':'negligible reverse current and a steep rise in forward current after the turn-on region');
      cases.add(metal?'graph metal':lamp?'graph lamp':'graph diode');break;
    }
    case 'as-u9-a6':{const [rho,length,area]=values(p,new RegExp(`resistivity ${num} × 10\\^-7 ohm m, length ${num} m.*area ${num} mm\\^2`));close(rho*1e-7*length/(area*1e-6));assert.ok(rho>0&&length>0&&area>0);electricalChecks++;break;}
    case 'as-u9-r1':{const hot=p.includes('is increased');assert.equal(semantic,hot?'the filament gets hotter and its resistance increases':'the filament gets cooler and its resistance decreases');cases.add(hot?'lamp hot':'lamp cool');break;}
    case 'as-u9-r2':{const bright=p.includes('intensity is increased');assert.equal(semantic,bright?'resistance decreases and current increases':'resistance increases and current decreases');cases.add(bright?'LDR bright':'LDR dim');break;}
    case 'as-u9-r3':{const hot=p.includes('a higher');assert.equal(semantic,hot?'resistance decreases and power increases':'resistance increases and power decreases');cases.add(hot?'NTC hot':'NTC cool');break;}
    case 'as-u9-r4':{
      const [microamps,time,e]=values(p,new RegExp(`of ${num} microamperes.*for ${num} s.*e = ${num} × 10\\^-19`));
      const count=microamps*1e-6*time/(e*1e-19);close(count/1e13);assert.ok(Number.isInteger(Number(answer))&&Number(answer)>0&&time>0&&time<1);
      assert.ok(!matcher(String(microamps*1e-6/(e*1e-19)/1e13),q.answers));electricalChecks++;break;
    }
    case 'as-u9-r5':{
      const [v,radiusFactor,currentFactor]=values(p,new RegExp(`speed ${num} × 10\\^-4.*magnitude, ${num} times.*carries ${num} times`));
      const density=5e28,charge=1.6e-19,radius=.0005,areaA=Math.PI*radius**2,currentA=areaA*density*v*1e-4*charge;
      const areaB=Math.PI*(radius*radiusFactor)**2,driftB=currentA*currentFactor/(areaB*density*charge);close(driftB/1e-4);
      assert.ok(driftB>0&&driftB<.01);assert.ok(!matcher(String(v*currentFactor/radiusFactor),q.answers));algebraChecks++;break;
    }
    case 'as-u9-r6':{
      const [original,factor]=values(p,new RegExp(`resistance ${num} ohms.*of ${num} times`));
      const rho=1e-6,length=1,area=rho*length/original,volume=length*area,newLength=length*factor,newArea=volume/newLength;
      close(rho*newLength/newArea);equal(newLength*newArea,volume);assert.ok(factor>1&&newArea>0&&newArea<area);assert.ok(!matcher(String(original*factor),q.answers));algebraChecks++;break;
    }
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
for(const c of ['metal','electrolyte','Ohm true','Ohm false','power VI','power I2R','power V2R','graph metal','graph lamp','graph diode','lamp hot','lamp cool','LDR bright','LDR dim','NTC hot','NTC cool'])if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u9.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,electricalChecks,algebraChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u9'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u9"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
