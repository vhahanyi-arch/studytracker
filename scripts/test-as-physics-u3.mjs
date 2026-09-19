import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u3.draft.mjs';

const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020318;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'), helpers={}, compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u3',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='3').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(), seen=new Map(), cases=new Set(), failures=new Set();
let questions=0, decimals=0, collisionChecks=0;
const num='([+-]?\\d+(?:\\.\\d+)?)';
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Oracle could not parse: ${p}`);return m.slice(1).map(Number);};
const equal=(a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
function oracle(q){
  const p=q.prompt, answer=q.answers[0];
  const opts=[...p.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)];
  if(opts.length){assert.equal(opts.length,4);assert.equal(new Set(opts.map(x=>x[2])).size,4);}
  const semantic=opts.find(o=>o[1]===answer)?.[2]??answer;
  const close=expected=>equal(Number(answer),expected,q.templateId);
  const pair=()=>{assert.match(answer,/^[+-]?\d+(?:\.\d+)?, [+-]?\d+(?:\.\d+)?$/);const result=answer.split(',').map(Number);assert.ok(!matcher(result.join(''),q.answers));assert.ok(!matcher('nonsense '+answer,q.answers));if(result[0]!==result[1])assert.ok(!matcher([...result].reverse().join(', '),q.answers));return result;};
  switch(q.templateId){
    case 'as-u3-f1':{const [a,b]=values(p,new RegExp(`A has mass ${num} kg and cart B has mass ${num} kg`));assert.ok(a>0&&b>0&&a!==b);assert.equal(semantic,a>b?'cart A':'cart B');break;}
    case 'as-u3-f2':{const [m,f]=values(p,new RegExp(`A ${num} kg.*force of ${num} N`));assert.ok(m>0);close(f/m);cases.add(f<0?'negative acceleration':'positive acceleration');break;}
    case 'as-u3-f3':{const [m,v]=values(p,new RegExp(`mass ${num} kg has velocity ${num} m/s`));assert.ok(m>0);close(m*v);cases.add(v<0?'negative momentum':'positive momentum');break;}
    case 'as-u3-f4':{const [m,g]=values(p,new RegExp(`mass ${num} kg.*free fall is ${num} m/s`));assert.ok(m>0&&g>0);close(m*g);assert.ok(Number(answer)>0);break;}
    case 'as-u3-f5':{const law=p.includes('zero resultant')?'first':p.includes('doubling')?'second':'third';assert.equal(answer,law);cases.add(law+' law');break;}
    case 'as-u3-f6':{const friction=p.includes('A box slides'), east=/ (?:moves|slides) east /.test(p);const direction=east?'west':'east';const increasing=p.includes('speed increases');assert.equal(semantic,friction?direction:`${direction}; ${increasing?'increases':'decreases'}`);cases.add(friction?'friction '+direction:`drag ${direction} ${increasing?'increasing':'decreasing'}`);break;}
    case 'as-u3-a1':{const [m,u,v,t]=values(p,new RegExp(`A ${num} kg.*at ${num} m/s and rebounds at ${num} m/s.*lasts ${num} s`));assert.ok(m>0&&t>0&&u>0&&v<0);close((m*v-m*u)/t);assert.ok(Number(answer)<0);assert.ok(v*v<=u*u,'Passive stationary-wall rebound gains kinetic energy');cases.add(v*v===u*u?'elastic wall rebound':'dissipative wall rebound');break;}
    case 'as-u3-a2':{const [w,d]=values(p,new RegExp(`weight is ${num} N.*resistance is ${num} N`));assert.ok(w>0&&d>0&&w!==d);assert.equal(semantic,w>d?'downwards; speed increases':'upwards; speed decreases');cases.add(w>d?'falling speeds up':'falling slows down');break;}
    case 'as-u3-a3':{const resultant=p.includes('True or false: the resultant');assert.equal(answer,resultant?'true':'false');cases.add(resultant?'zero resultant':'nonzero resistance');break;}
    case 'as-u3-a4':{const [a,u,b]=values(p,new RegExp(`A of mass ${num} kg moves at ${num} m/s.*B of mass ${num} kg`));const v=a*u/(a+b);close(v);equal((a+b)*Number(answer),a*u,'1D inelastic momentum');assert.ok(a>0&&b>0&&u>0&&v>0&&v<u);assert.ok((a+b)*v*v<a*u*u);collisionChecks++;break;}
    case 'as-u3-a5':{const isolated=p.includes('force is zero throughout');assert.equal(semantic,isolated?'It is conserved because the net external impulse is zero.':'It changes because the net external impulse is nonzero.');cases.add(isolated?'isolated system':'external impulse');break;}
    case 'as-u3-a6':{const [u,w]=values(p,new RegExp(`A moves right at ${num} m/s and B moves left at ${num} m/s`));close(u+w);assert.ok(u>0&&w>0);break;}
    case 'as-u3-r1':{const gravity=p.includes('Consider the downward gravitational');assert.equal(semantic,gravity?'upward gravitational force of the book on Earth':'downward contact force of the book on the table');cases.add(gravity?'gravity pair':'contact pair');break;}
    case 'as-u3-r2':{const increases=p.includes('shape increases');assert.equal(semantic,increases?'upwards; lower; equal to weight':'downwards; higher; equal to weight');cases.add(increases?'lower terminal speed':'higher terminal speed');break;}
    case 'as-u3-r3':{const [m,u,w]=values(p,new RegExp(`each of mass ${num} kg.*at ${num} m/s rightwards and ${num} m/s leftwards`));const v=(u-w)/2;equal(2*m*v,m*u-m*w,'signed inelastic momentum');close(m*(u+w)**2/4);equal(Number(answer),m*(u*u+w*w)/2-m*v*v,'energy loss');assert.ok(Number(answer)>0);cases.add(v<0?'merged left':v>0?'merged right':'merged at rest');collisionChecks++;break;}
    case 'as-u3-r4':{const [a,u,b,v]=values(p,new RegExp(`a ${num} kg puck moving east at ${num} m/s.*a ${num} kg puck moving north at ${num} m/s`));const [x,y]=pair();equal((a+b)*x,a*u,'2D inelastic east momentum');equal((a+b)*y,b*v,'2D inelastic north momentum');assert.ok(a>0&&b>0&&x>0&&y>0);assert.ok((a+b)*(x*x+y*y)<a*u*u+b*v*v);collisionChecks++;break;}
    case 'as-u3-r5':{const [a,u,b]=values(p,new RegExp(`A of mass ${num} kg moves right at ${num} m/s.*B of mass ${num} kg`));const [va,vb]=pair();equal(va,(a-b)*u/(a+b));equal(vb,2*a*u/(a+b));equal(a*va+b*vb,a*u,'1D elastic momentum');equal(a*va*va+b*vb*vb,a*u*u,'1D elastic kinetic energy');equal(vb-va,u,'relative separation');assert.ok(a>0&&b>0&&vb>va);cases.add(va<0?'elastic A rebounds':'elastic A continues');collisionChecks++;break;}
    case 'as-u3-r6':{const [u,ax,ay]=values(p,new RegExp(`A moves east at ${num} m/s.*components \\(${num}, ${num}\\) m/s`));const [bx,by]=pair();equal(ax+bx,u,'2D elastic east momentum');equal(ay+by,0,'2D elastic north momentum');equal(ax*ax+ay*ay+bx*bx+by*by,u*u,'2D elastic kinetic energy');equal(ax*bx+ay*by,0,'equal-mass perpendicular outgoing velocities');assert.ok(u>0&&u<=25&&ax>0&&bx>0&&ay*by<0);cases.add(ay>0?'deflect north':'deflect south');collisionChecks++;break;}
    default:assert.fail(q.templateId);
  }
  if(opts.length)for(const opt of opts)if(opt[1]!==answer)assert.ok(!matcher(opt[1],q.answers));
  if(/^-?\d+(?:\.\d+)?$/.test(answer))assert.ok(!matcher(String(Number(answer)+1),q.answers));
  return semantic;
}
for(const tier of ['foundational','application','reasoning'])for(let i=0;i<iterations;i++){
  const qs=generate(tier);assert.equal(qs.length,6);assert.equal(new Set(qs.map(q=>q.prompt)).size,6);
  for(const q of qs){
    questions++;assert.equal(q.difficulty,tier);assert.ok(objectiveIds.includes(q.objective));coverage.add(q.objective);
    assert.ok(q.templateId&&q.hint&&q.solution&&q.answerFormat&&q.answers.length);
    for(const answer of q.answers)assert.ok(matcher(answer,q.answers));
    if(/\d+\.\d{5,}/.test([q.prompt,q.hint,q.solution,...q.answers].join(' '))){decimals++;failures.add(`${q.templateId}: ugly decimal`);}
    assert.ok(!/NaN|Infinity|undefined/.test(JSON.stringify(q)));
    try{const semantic=oracle(q);if(!seen.has(q.templateId))seen.set(q.templateId,{prompts:new Set(),answers:new Set()});seen.get(q.templateId).prompts.add(q.prompt);seen.get(q.templateId).answers.add(semantic);}
    catch(error){failures.add(`${q.templateId}: ${error.message}`);}
  }
}
assert.deepEqual([...coverage].sort(),objectiveIds.sort());
for(const [id,s]of seen)assert.ok(s.answers.size>1,`${id}: fake randomization`);
const expectedCases=['negative acceleration','positive acceleration','negative momentum','positive momentum','first law','second law','third law','friction east','friction west','drag east increasing','drag east decreasing','drag west increasing','drag west decreasing','falling speeds up','falling slows down','zero resultant','nonzero resistance','isolated system','external impulse','gravity pair','contact pair','lower terminal speed','higher terminal speed','merged left','merged right','merged at rest','elastic A rebounds','elastic A continues','deflect north','deflect south','elastic wall rebound','dissipative wall rebound'];
for(const required of expectedCases)if(!cases.has(required))failures.add('Missing branch: '+required);
const body=fs.readFileSync('scripts/as-physics-u3.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0];
const ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}
visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,collisionChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){
  const draft=createDraft(helpers.testHelpers);
  for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u3'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u3"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
