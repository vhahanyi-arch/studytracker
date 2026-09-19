import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u2.draft.mjs';

const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020217;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8');
const helpers={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
const compiled={};
if(production) vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u2',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='2').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(), seen=new Map(), failures=new Set();
const cases=new Set();
let questions=0, decimals=0;
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Oracle could not read: ${p}`);return m.slice(1).map(Number);};
const num='(-?\\d+(?:\\.\\d+)?)';
function oracle(q) {
  const p=q.prompt, answer=q.answers[0];
  const opts=[...p.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)];
  if(opts.length) {assert.equal(opts.length,4);assert.equal(new Set(opts.map(o=>o[2])).size,4);}
  const semantic=opts.find(o=>o[1]===answer)?.[2]??answer;
  const close=x=>{assert.ok(Number.isFinite(Number(answer)));assert.ok(Math.abs(Number(answer)-x)<1e-8,`${q.templateId}: expected ${x}, got ${answer}`);};
  switch(q.templateId) {
    case 'as-u2-f1': {
      const definitions={'total path length travelled':'distance','change in position with direction':'displacement','distance travelled per unit time':'speed','rate of change of displacement':'velocity','rate of change of velocity':'acceleration'};
      const definition=/defined as (.*?)\?/.exec(p)[1];assert.equal(answer,definitions[definition]);cases.add(answer);break;
    }
    case 'as-u2-f2': {
      const graph=/its (.*?) graph\?/.exec(p)[1];cases.add(graph);
      const expected={'displacement–time':'a straight line with positive gradient','distance-travelled–time':'a straight line with positive gradient','velocity–time':'a horizontal line below zero','acceleration–time':'a horizontal line above zero','speed–time':'a horizontal line above zero'};
      assert.equal(semantic,expected[graph]);break;
    }
    case 'as-u2-f3': {const [v,t]=values(p,new RegExp(`horizontal at ${num} m/s.*to t = ${num} s`));close(v*t);cases.add(v<0?'negative area':'positive area');break;}
    case 'as-u2-f4': {const [t0,s0,t1,s1]=values(p,new RegExp(`t = ${num} s, s = ${num} m.*t = ${num} s, s = ${num} m`));assert.ok(t1>t0);close((s1-s0)/(t1-t0));cases.add(s1<s0?'negative gradient':'positive gradient');break;}
    case 'as-u2-f5': {const [u,t,v]=values(p,new RegExp(`v = ${num} m/s.*t = ${num} s, v = ${num} m/s`));assert.ok(t>0);close((v-u)/t);break;}
    case 'as-u2-f6': {const [u,a,t]=values(p,new RegExp(`initial velocity ${num} m/s and constant acceleration ${num} m/s\\^2 for ${num} s`));close(u+a*t);assert.ok(Number(answer)>0&&Number(answer)<=30);break;}
    case 'as-u2-a1': {const [east,t1,west,t2]=values(p,new RegExp(`travels ${num} m east in ${num} s, then ${num} m west in ${num} s`));const speed=p.includes('average speed');close((east+(speed?west:-west))/(t1+t2));if(speed)assert.ok(Number(answer)>0);cases.add(speed?'average speed':'average velocity');break;}
    case 'as-u2-a2': {const [u,t,v]=values(p,new RegExp(`from \\(0 s, ${num} m/s\\) to \\(${num} s, ${num} m/s`));close(u*t+(v-u)*t/2);assert.ok(v>=u&&u>0&&t>0);break;}
    case 'as-u2-a3': {const second=p.includes('Substitute u =');assert.equal(semantic,second?'-0.5at^2':'0.5at^2');cases.add(second?'derive final-velocity form':'derive initial-velocity form');break;}
    case 'as-u2-a4': {const [h,t]=values(p,new RegExp(`falls ${num} mm in ${num} ms`));close(2*(h/1000)/(t/1000)**2);assert.ok(h>0&&h<2000&&t>0&&t<1000);assert.ok(Number(answer)>=9.6&&Number(answer)<=10);break;}
    case 'as-u2-a5': {const [h,v]=values(p,new RegExp(`platform ${num} m above level ground at ${num} m/s`));close(v*Math.sqrt(h/5));assert.ok(Number(answer)>0&&v<=10);break;}
    case 'as-u2-a6': {const [h]=values(p,new RegExp(`rest ${num} m above`));close(Math.sqrt(20*h));assert.ok(Number(answer)>0&&Number(answer)<=40);break;}
    case 'as-u2-r1': {const [u,t,v]=values(p,new RegExp(`from \\(0 s, ${num} m/s\\) to \\(${num} s, ${num} m/s`));const zero=-u*t/(v-u);assert.ok(u>0&&v<0&&zero>0&&zero<t);const signed=(u+v)*t/2, travelled=(u*zero-v*(t-zero))/2;const distance=p.includes('total distance');close(distance?travelled:signed);assert.ok(travelled>=Math.abs(signed));cases.add(distance?'reversal distance':'reversal displacement');break;}
    case 'as-u2-r2': {const expanded=p.includes('gives 2as');assert.equal(semantic,expanded?'v^2 - u^2':'(v^2 - u^2)/(2a)');cases.add(expanded?'eliminate time identity':'eliminate time displacement');break;}
    case 'as-u2-r3': {const [v,t,a]=values(p,new RegExp(`at ${num} m/s during a reaction time of ${num} s.*magnitude ${num} m/s\\^2`));const brakingTime=v/a;close(v*t+(v/2)*brakingTime);assert.ok(v>0&&v<=30&&a>0&&t>0&&Number(answer)>v*t);break;}
    case 'as-u2-r4': {const [vx,vy]=values(p,new RegExp(`horizontal velocity ${num} m/s and upward velocity ${num} m/s`));close(vx*(vy/5));assert.ok(vx>0&&vy>0&&Math.hypot(vx,vy)<40);break;}
    case 'as-u2-r5': {const early=p.includes('before release');assert.equal(semantic,early?'The measured time is too long, so g is underestimated.':'The measured time is too short, so g is overestimated.');cases.add(early?'early timer':'late timer');break;}
    case 'as-u2-r6': {const [u,h]=values(p,new RegExp(`upwards at ${num} m/s from a cliff ${num} m above`));const positiveRootTime=(u+Math.sqrt(u*u+20*h))/10;close(u-10*positiveRootTime);assert.ok(h>0&&h<=300&&Number(answer)<0);break;}
    default: assert.fail(q.templateId);
  }
  if(opts.length) for(const opt of opts) if(opt[1]!==answer) assert.ok(!matcher(opt[1],q.answers));
  if(/^-?\d+(?:\.\d+)?$/.test(answer)) assert.ok(!matcher(String(Number(answer)+1),q.answers));
  return semantic;
}
for(const tier of ['foundational','application','reasoning']) for(let i=0;i<iterations;i++) {
  const qs=generate(tier);assert.equal(qs.length,6);assert.equal(new Set(qs.map(q=>q.prompt)).size,6);
  for(const q of qs) {
    questions++;assert.equal(q.difficulty,tier);assert.ok(objectiveIds.includes(q.objective));coverage.add(q.objective);
    assert.ok(q.templateId&&q.hint&&q.solution&&q.answerFormat);assert.ok(q.answers.length>0);
    for(const answer of q.answers)assert.ok(matcher(answer,q.answers));
    if(/\d+\.\d{5,}/.test([q.prompt,q.hint,q.solution,...q.answers].join(' '))) {decimals++;failures.add(`${q.templateId}: ugly decimal`);}
    assert.ok(!/NaN|Infinity|undefined/.test(JSON.stringify(q)));
    try {
      const semantic=oracle(q);
      if(!seen.has(q.templateId))seen.set(q.templateId,{prompts:new Set(),answers:new Set()});
      seen.get(q.templateId).prompts.add(q.prompt);seen.get(q.templateId).answers.add(semantic);
    } catch(error){failures.add(`${q.templateId}: ${error.message}`);}
  }
}
assert.deepEqual([...coverage].sort(),objectiveIds.sort());
assert.equal(seen.size,18,'Each template must pass its independent oracle');
for(const [id,s] of seen)assert.ok(s.answers.size>1,`${id}: fake randomization`);
for(const required of ['distance','displacement','speed','velocity','acceleration','displacement–time','distance-travelled–time','speed–time','velocity–time','acceleration–time','negative area','positive area','negative gradient','positive gradient','average speed','average velocity','derive final-velocity form','derive initial-velocity form','reversal distance','reversal displacement','eliminate time identity','eliminate time displacement','early timer','late timer'])assert.ok(cases.has(required),required);
const draftBody=fs.readFileSync('scripts/as-physics-u2.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0];
const ast=ts.createSourceFile('draft.js',draftBody,ts.ScriptTarget.Latest,true);
let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}
visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);
if(production){
  const draft=createDraft(helpers.testHelpers);
  for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){
    const before=state, expected=draft(tier);state=before;
    assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');
  }
  assert.ok(compiled.supportsPhysicsUnit('as','as-u2'));
  if(!process.argv.includes('--before-enable')) assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u2"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
