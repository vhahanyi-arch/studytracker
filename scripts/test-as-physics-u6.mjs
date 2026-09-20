import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u6.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020620;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u6',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='6').groups.flatMap(g=>g.objectives.map(o=>o.id));
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
    case 'as-u6-f1':{const pulling=p.includes('pulling');assert.equal(semantic,pulling?'tensile':'compressive');cases.add(semantic);break;}
    case 'as-u6-f2':{const [l0,l1]=values(p,new RegExp(`length ${num} cm.*becomes ${num} cm`));close(Math.abs(l1-l0));assert.ok(l0>0&&l1>0);assert.equal(p.includes('its extension'),l1>l0);cases.add(l1>l0?'extension':'compression');break;}
    case 'as-u6-f3':{const [x,f]=values(p,new RegExp(`by ${num} cm.*force of ${num} N`));close(f/(x*.01));assert.ok(x>0&&f>0);break;}
    case 'as-u6-f4':{const [k,x]=values(p,new RegExp(`constant ${num} N/m.*by ${num} cm`));close(k*x*.01);assert.ok(k>0&&x>0);break;}
    case 'as-u6-f5':{const [area,f]=values(p,new RegExp(`area ${num} mm\\^2.*force of ${num} N`));const pascals=f/(area*1e-6);close(pascals/1e6);assert.ok(area>0&&f>0);break;}
    case 'as-u6-f6':{const elastic=p.includes('is elastic');assert.equal(answer,elastic?'true':'false');cases.add('elastic '+elastic);break;}
    case 'as-u6-a1':{const [l,x]=values(p,new RegExp(`length ${num} m.*extension ${num} mm`));close(x*.001/l);assert.ok(l>0&&x>0&&x*.001<l*.01);
      assert.ok(!matcher('0',q.answers),'Zero incorrectly accepted as nonzero strain');
      assert.ok(!matcher(String(Number(answer)*1.1),q.answers),'Ten-percent strain error incorrectly accepted');
      assert.ok(matcher(String(Number(answer)*1.0005),q.answers),'A strain answer within 0.1% should pass');break;}
    case 'as-u6-a2':{const [stress,strain]=values(p,new RegExp(`stress ${num} MPa.*strain ${num}`));close(stress*1e6/strain/1e9);assert.ok(strain>0&&strain<.01&&Number(answer)>=50&&Number(answer)<=200);break;}
    case 'as-u6-a3':{
      if(p.includes('diameter accurately')){assert.equal(semantic,'use a micrometer at several positions and orientations, then average the diameters');cases.add('diameter');}
      else if(p.includes('measuring L')){assert.equal(semantic,'use a metre rule along the wire between the gauge marks');cases.add('length');}
      else if(p.includes('obtaining the modulus')){assert.equal(semantic,'plot force F against extension x in the proportional region and multiply the gradient by L/A');cases.add('experiment graph');}
      else {assert.ok(p.includes('collecting a series'));assert.equal(semantic,'increase the load in small steps within the proportional region and measure each extension from the original length');cases.add('experiment readings');}
      break;
    }
    case 'as-u6-a4':{
      const [x1,f1,x2,f2]=values(p,new RegExp(`\\(${num} cm, ${num} N\\) and \\(${num} cm, ${num} N\\)`));
      const knots=[[0,0],[x1*.01,f1],[x2*.01,f2]];
      // Integrate each displayed segment from its endpoints, independent of the draft's simplification.
      let work=0;for(let i=1;i<knots.length;i++)work+=(knots[i][0]-knots[i-1][0])*(knots[i][1]+knots[i-1][1])/2;
      close(work);assert.ok(x1>0&&x2>x1&&f1>0&&f2>f1);assert.notEqual(f1/x1,f2/x2);assert.ok(Math.abs(work-f2*x2*.005)>.001);energyChecks++;break;
    }
    case 'as-u6-a5':{const [x,f]=values(p,new RegExp(`to \\(${num} cm, ${num} N\\)`));close(f*x*.005);assert.ok(f>0&&x>0);energyChecks++;break;}
    case 'as-u6-a6':{const [k,x]=values(p,new RegExp(`constant ${num} N/m.*by ${num} cm`));const force=k*x*.01;close(force*x*.005);assert.ok(k>0&&x>0);energyChecks++;break;}
    case 'as-u6-r1':{
      const [x,lengthFactor,radiusFactor]=values(p,new RegExp(`extends ${num} mm.*has ${num} times.*and ${num} times`));
      const radiusA=.0005, force=10, lengthA=4, modulus=force*lengthA/(Math.PI*radiusA**2*x*.001);
      const lengthB=lengthFactor*lengthA, areaB=Math.PI*(radiusFactor*radiusA)**2;
      close(force*lengthB/(areaB*modulus)*1000);
      assert.ok(x*.001/lengthA<.01&&Number(answer)*.001/lengthB<.01);algebraChecks++;break;
    }
    case 'as-u6-r2':{
      const radius=p.includes('substitutes the radius');const expected=radius?4:.25;
      const ratios={'four times the true modulus':4,'one quarter of the true modulus':.25,'twice the true modulus':2,'half the true modulus':.5};
      assert.equal(ratios[semantic],expected);assert.equal(opts.filter(o=>ratios[o[2]]===expected).length,1);
      const rad=.0004, area=Math.PI*rad**2, wrongArea=radius?Math.PI*rad**2/4:Math.PI*(2*rad)**2;equal(area/wrongArea,expected);
      cases.add(radius?'radius as diameter':'diameter as radius');algebraChecks++;break;
    }
    case 'as-u6-r3':{const plastic=p.includes('retains a permanent');assert.equal(semantic,plastic?'the elastic limit was exceeded and plastic deformation occurred':'the proportionality limit was exceeded but the deformation was elastic');cases.add(plastic?'plastic':'nonlinear elastic');break;}
    case 'as-u6-r4':{
      const [input,xmax,f,residual]=values(p,new RegExp(`takes ${num} J.*to ${num} cm at force ${num} N.*extension ${num} cm`));
      const output=(xmax-residual)*.01*f/2,lost=p.includes('Find the energy dissipated');
      close(lost?input-output:output);assert.ok(residual>0&&xmax>residual&&input>output&&output>0);equal(output+(input-output),input);
      cases.add(lost?'dissipated':'returned');energyChecks++;break;
    }
    case 'as-u6-r5':{const [k,f,proposal]=values(p,new RegExp(`constant ${num} N/m.*force ${num} N.*extension of ${num} cm`));close(f/k*100);assert.ok(k>0&&f>0&&proposal>Number(answer));algebraChecks++;break;}
    case 'as-u6-r6':{
      const [k,x0,x1]=values(p,new RegExp(`constant ${num} N/m.*by ${num} cm.*to ${num} cm`));
      // Work over the change in extension is a trapezium, not a triangle from the origin.
      const f0=k*x0*.01,f1=k*x1*.01,work=(f0+f1)*(x1-x0)*.01/2;
      close(work);equal(work+k*(x0*.01)**2/2,k*(x1*.01)**2/2);assert.ok(x1>x0&&x0>0&&k>0);
      assert.ok(Math.abs(work-k*((x1-x0)*.01)**2/2)>.001);energyChecks++;break;
    }
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
for(const c of ['tensile','compressive','extension','compression','elastic true','elastic false','diameter','length','experiment graph','experiment readings','radius as diameter','diameter as radius','plastic','nonlinear elastic','dissipated','returned'])if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u6.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,energyChecks,algebraChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u6'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u6"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
