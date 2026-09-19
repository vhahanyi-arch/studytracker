import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u5.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020519;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u5',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='5').groups.flatMap(g=>g.objectives.map(o=>o.id));
const coverage=new Set(),seen=new Map(),cases=new Set(),failures=new Set();
let questions=0,decimals=0,energyChecks=0,algebraChecks=0;
const num='([+-]?\\d+(?:\\.\\d+)?)';
const values=(p,re)=>{const m=re.exec(p);assert.ok(m,`Cannot parse: ${p}`);return m.slice(1).map(Number);};
const equal=(a,b,label='')=>assert.ok(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
function oracle(q){
  const p=q.prompt,answer=q.answers[0],opts=[...p.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)];
  if(opts.length){assert.equal(opts.length,4);assert.equal(new Set(opts.map(o=>o[2])).size,4);}
  const semantic=opts.find(o=>o[1]===answer)?.[2]??answer,close=x=>equal(Number(answer),x,q.templateId);
  switch(q.templateId){
    case 'as-u5-f1':{const [s,f]=values(p,new RegExp(`displaced ${num} m east.*force of ${num} N`));const direction=/ N acts (\w+)\./.exec(p)[1];close(f*s*{east:1,west:-1,north:0}[direction]);cases.add('work '+direction);break;}
    case 'as-u5-f2':{const conserved=p.includes('total energy remains');assert.equal(answer,conserved?'true':'false');cases.add(conserved?'energy conserved':'energy not destroyed');break;}
    case 'as-u5-f3':{const [input,useful]=values(p,new RegExp(`receives ${num} J.*delivers ${num} J`));close(useful/input*100);assert.ok(input>useful&&useful>0&&Number(answer)>0&&Number(answer)<100);break;}
    case 'as-u5-f4':{const quicker=p.includes('takes less');assert.equal(semantic,quicker?'machine A':'machine B');cases.add(quicker?'A more powerful':'B more powerful');break;}
    case 'as-u5-f5':{const [m,h0,h1]=values(p,new RegExp(`A ${num} kg.*height ${num} m to height ${num} m`));close(m*10*(h1-h0));assert.ok(m>0&&h0>=0&&h1>=0);cases.add(h1>h0?'potential gain':'potential loss');break;}
    case 'as-u5-f6':{const [m,v]=values(p,new RegExp(`mass ${num} kg.*speed ${num} m/s`));close(m*v*v/2);assert.ok(m>0&&v>0);break;}
    case 'as-u5-a1':{const [w,t]=values(p,new RegExp(`does ${num} J.*in ${num} s`));close(w/t);assert.ok(w>0&&t>0);break;}
    case 'as-u5-a2':{const [pIn,eta,t]=values(p,new RegExp(`input power ${num} W.*efficiency ${num}%.*for ${num} s`));const useful=pIn*t*eta/100;close(pIn*t-useful);equal(useful+Number(answer),pIn*t);assert.ok(eta>0&&eta<100&&Number(answer)>0);energyChecks++;break;}
    case 'as-u5-a3':{const rearrange=p.includes('Rearrange');assert.equal(semantic,rearrange?'P/F':'Fv');cases.add(rearrange?'rearrange power':'derive power');const F=7,v=3,P=21;const expressions={'Fv':F*v,'P/F':P/F,'F/v':F/v,'Pv':P*v};assert.equal(opts.filter(o=>Math.abs(expressions[o[2]]-(rearrange?v:P))<1e-8).length,1);algebraChecks++;break;}
    case 'as-u5-a4':{const raising=p.includes('raised slowly');assert.equal(semantic,raising?'mgΔh':'-mgΔh');cases.add(raising?'derive positive GPE':'derive negative GPE');const m=3,g=10,h=4;const expressions={'mgΔh':m*g*h,'-mgΔh':-m*g*h,'mg/Δh':m*g/h,'mΔh/g':m*h/g};assert.equal(opts.filter(o=>expressions[o[2]]===(raising?1:-1)*m*g*h).length,1);algebraChecks++;break;}
    case 'as-u5-a5':{
      const rest=p.includes('from rest');assert.equal(semantic,rest?'0.5mv^2':'0.5m(v^2 - u^2)');cases.add(rest?'derive KE from rest':'derive KE change');
      // Evaluate EVERY candidate, not just the keyed one: u=0 can make distractors equivalent.
      for(const [m,u,v]of rest?[[2,0,6],[3,0,8]]:[[2,2,6],[3,3,8]]){
        const expressions={'0.5m(v^2 - u^2)':m*(v*v-u*u)/2,'0.5mv^2':m*v*v/2,'m(v - u)':m*(v-u),'mv^2':m*v*v,'0.5mv':m*v/2,'m/v^2':m/(v*v),'0.5m(v - u)^2':m*(v-u)**2/2,'m(v^2 - u^2)':m*(v*v-u*u)};
        const work=m*((v*v-u*u)/2);
        assert.equal(opts.filter(o=>Math.abs(expressions[o[2]]-work)<1e-8).length,1,'Kinetic-energy derivation has equivalent correct options');
        algebraChecks++;
      }break;
    }
    case 'as-u5-a6':{const [h]=values(p,new RegExp(`drop of ${num} m`));close(Math.sqrt(20*h));equal(Number(answer)**2/2,10*h);assert.ok(h>0&&Number(answer)>0);energyChecks++;break;}
    case 'as-u5-r1':{const [s,f,angle]=values(p,new RegExp(`displaced ${num} m.*force of ${num} N.*angle of ${num}°`));close(f*s*Math.cos(angle*Math.PI/180));cases.add(angle<90?'angled positive work':'angled negative work');break;}
    case 'as-u5-r2':{const [e1,e2,input]=values(p,new RegExp(`first has efficiency ${num}%.*efficiency ${num}%.*receives ${num} J`));const stage1=input*e1/100,output=stage1*e2/100;close(output);assert.ok(input>stage1&&stage1>output&&output>0);equal((input-stage1)+(stage1-output)+output,input);energyChecks++;break;}
    case 'as-u5-r3':{const [pIn,eta,m,h]=values(p,new RegExp(`power ${num} W.*efficiency ${num}%.*a ${num} kg.*through ${num} m`));close(m*10*h/(pIn*eta/100));const t=Number(answer);equal(pIn*t*eta/100,m*10*h);assert.ok(t>0&&eta>0&&eta<100&&pIn*t>m*10*h);energyChecks++;break;}
    case 'as-u5-r4':{const [m,v,d]=values(p,new RegExp(`A ${num} kg.*at ${num} m/s.*total ${num} N`));const gravity=m*10*.1;close((gravity+d)*v);equal(Number(answer)/v,gravity+d);assert.ok(m>0&&v>0&&d>0);energyChecks++;break;}
    case 'as-u5-r5':{const [u,h]=values(p,new RegExp(`upwards at ${num} m/s.*point ${num} m above`));const up=p.includes('while ascending');close((up?1:-1)*Math.sqrt(u*u-20*h));equal(Number(answer)**2/2+10*h,u*u/2);assert.ok(h>0&&h<u*u/20);cases.add(up?'ascending velocity':'descending velocity');energyChecks++;break;}
    case 'as-u5-r6':{const [m,u,v,s]=values(p,new RegExp(`A ${num} kg.*from ${num} m/s to ${num} m/s over ${num} m`));const f=m*(v*v-u*u)/(2*s);close(f);equal(Number(answer)*s+m*u*u/2,m*v*v/2);equal(v*v/(u*u),.25);assert.ok(m>0&&s>0&&u>v&&v>0&&Number(answer)<0);energyChecks++;break;}
    default:assert.fail(q.templateId);
  }
  if(opts.length)for(const o of opts)if(o[1]!==answer)assert.ok(!matcher(o[1],q.answers));
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
for(const [id,s]of seen)if(s.answers.size<2)failures.add(id+': insufficient semantic variation');
for(const c of ['work east','work west','work north','energy conserved','energy not destroyed','A more powerful','B more powerful','potential gain','potential loss','rearrange power','derive power','derive positive GPE','derive negative GPE','derive KE from rest','derive KE change','angled positive work','angled negative work','ascending velocity','descending velocity'])if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u5.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,energyChecks,algebraChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u5'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u5"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
