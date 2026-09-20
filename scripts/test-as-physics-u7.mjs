import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u7.draft.mjs';
const production=process.argv.includes('--production');
const iterations=Number(process.argv.find(x=>x.startsWith('--iterations='))?.split('=')[1]||3000);
let state=97020720;
const math=Object.assign(Object.create(Math),{random:()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}});
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8'),helpers={},compiled={};
vm.runInNewContext(ts.transpileModule(source+'\nexport const testHelpers={sq,r,validateUnitSet};',{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText,{exports:helpers,Math:math});
if(production)vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:math});
const generate=production?tier=>compiled.makePhysicsQuestions('as','as-u7',tier):createDraft(helpers.testHelpers);
const matcher=production?compiled.answerMatches:helpers.answerMatches;
const objectiveIds=JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8')).topics.find(t=>t.id==='7').groups.flatMap(g=>g.objectives.map(o=>o.id));
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
    case 'as-u7-f1':{const rope=p.includes('marked section of rope');assert.equal(semantic,rope?'oscillates about equilibrium perpendicular to the direction the disturbance travels':'oscillates about equilibrium parallel to the direction the disturbance travels');cases.add(rope?'rope':'spring');break;}
    case 'as-u7-f2':{const expected=p.includes('greatest magnitude')?'amplitude':p.includes('time for')?'period':p.includes('per second')?'frequency':'wavelength';assert.equal(semantic,expected);cases.add(expected);break;}
    case 'as-u7-f3':{const [power,area]=values(p,new RegExp(`power ${num} W.*area of ${num} m\\^2`));close(power/area);assert.ok(power>0&&area>0);waveChecks++;break;}
    case 'as-u7-f4':{const transverse=p.includes('vertically');assert.equal(semantic,transverse?'transverse':'longitudinal');cases.add(semantic);break;}
    case 'as-u7-f5':{const valid=p.includes('are transverse');assert.equal(answer,valid?'true':'false');cases.add('EM '+valid);break;}
    case 'as-u7-f6':{const correct=opts.filter(o=>{const nm=Number(o[2].split(' ')[0]);return nm>=400&&nm<=700;});assert.equal(correct.length,1);assert.equal(semantic,correct[0][2]);break;}
    case 'as-u7-a1':{
      if(p.includes('time-base')){const [base,divs]=values(p,new RegExp(`to ${num} ms/div.*spans ${num} horizontal`));close(1/(base*divs/1000));assert.ok(base>0&&divs>=2&&divs<=10);cases.add('CRO frequency');}
      else {const [gain,divs]=values(p,new RegExp(`to ${num} V/div.*height of ${num} vertical`));close(gain*divs/2);assert.ok(gain>0&&divs>0);assert.ok(!matcher(String(gain*divs),q.answers));cases.add('CRO amplitude');}
      waveChecks++;break;
    }
    case 'as-u7-a2':{
      const wavelength=p.includes('expression gives λ');assert.equal(semantic,wavelength?'v/f':'fλ');cases.add(wavelength?'derive wavelength':'derive speed');
      for(const [f,lambda] of [[2,3],[5,7]]){const v=f*lambda;const expressions={'v/f':v/f,'vf':v*f,'f/v':f/v,'1/(vf)':1/(v*f),'fλ':f*lambda,'λ/f':lambda/f,'f/λ':f/lambda,'1/(fλ)':1/(f*lambda)};
        assert.equal(opts.filter(o=>Math.abs(expressions[o[2]]-(wavelength?lambda:v))<1e-8).length,1);algebraChecks++;
      }break;
    }
    case 'as-u7-a3':{const [f,lambda]=values(p,new RegExp(`frequency ${num} Hz.*wavelength ${num} cm`));close(f*lambda/100);assert.ok(f>0&&lambda>0&&Number(answer)<100);waveChecks++;break;}
    case 'as-u7-a4':{const [x0,x1]=values(p,new RegExp(`x = ${num} cm.*x = ${num} cm`));const opposite=p.includes('next negative');close((x1-x0)*(opposite?2:1));assert.ok(x1>x0);cases.add(opposite?'graph opposite':'graph same');waveChecks++;break;}
    case 'as-u7-a5':{
      const [fs,vs,v]=values(p,new RegExp(`emits at ${num} Hz.*at ${num} m/s.*is ${num} m/s`));const towards=p.includes('towards');
      // Construct wavefront separation from distance travelled during one source period.
      const period=1/fs,lambda=v*period+(towards?-1:1)*vs*period;
      close(v/lambda);assert.ok(v>vs&&vs>0&&fs>0&&lambda>0);assert.equal(Number(answer)>fs,towards);
      cases.add(towards?'Doppler approach':'Doppler recede');waveChecks++;break;
    }
    case 'as-u7-a6':{
      const bands=[['10 m','radio waves (excluding microwaves)'],['10 mm','microwaves'],['10 micrometres','infrared'],['500 nm','visible light'],['100 nm','ultraviolet'],['0.1 nm','X-rays'],['0.001 nm','gamma rays']];
      const index=bands.findIndex(([w])=>p.includes('wavelength of '+w+'?'));assert.ok(index>=0);assert.equal(semantic,bands[index][1]);cases.add('band '+index);break;
    }
    case 'as-u7-r1':{const valid=p.includes('can still transfer');assert.equal(answer,valid?'true':'false');cases.add('energy '+valid);break;}
    case 'as-u7-r2':{const towards=p.includes('towards');assert.equal(semantic,towards?'wavefront spacing decreases; sound speed is unchanged and observed frequency increases':'wavefront spacing increases; sound speed is unchanged and observed frequency decreases');cases.add(towards?'spacing approach':'spacing recede');break;}
    case 'as-u7-r3':{const polarises=p.includes('can be restricted');assert.equal(semantic,polarises?'it is transverse, with oscillations perpendicular to propagation':'its oscillations are parallel to propagation, so there is no transverse oscillation direction to select');cases.add(polarises?'polarises':'sound');break;}
    case 'as-u7-r4':{
      const [input,first,second]=values(p,new RegExp(`intensity ${num} W/m\\^2.*axes are at ${num}° and then ${num}°`));
      const cos2=degrees=>Math.cos(degrees*Math.PI/180)**2;
      const afterFirst=input*cos2(first),expected=afterFirst*cos2(second-first);close(expected);
      assert.ok(input>0&&Number(answer)>=0&&Number(answer)<=afterFirst+1e-8);
      // The described erroneous method must actually differ from the correct method.
      assert.ok(Math.abs(expected-afterFirst*cos2(second))>1e-8,'Wrong angle method accidentally gives the correct answer');
      cases.add('angle '+(second-first));waveChecks++;break;
    }
    case 'as-u7-r5':{const [power,area,factor,newArea]=values(p,new RegExp(`carries ${num} W.*area of ${num} m\\^2.*amplitude is ${num} times.*area of ${num} m\\^2`));close(power/area*factor**2*newArea);assert.ok(power>0&&area>0&&newArea>0&&factor>1);assert.ok(!matcher(String(power/area*factor*newArea),q.answers));waveChecks++;break;}
    case 'as-u7-r6':{const [t0,t1,tb]=values(p,new RegExp(`maxima at ${num} ms and ${num} ms.*maximum is at ${num} ms`));close(360*(tb-t0)/(t1-t0));assert.ok(t1>tb&&tb>t0&&Number(answer)>0&&Number(answer)<360);cases.add('phase '+answer);waveChecks++;break;}
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
for(const c of ['rope','spring','amplitude','period','frequency','wavelength','transverse','longitudinal','EM true','EM false','CRO frequency','CRO amplitude','derive speed','derive wavelength','graph opposite','graph same','Doppler approach','Doppler recede','energy true','energy false','spacing approach','spacing recede','polarises','sound','angle 0','angle 30','angle 45','angle 60','angle 90','phase 90','phase 180','phase 270',...Array.from({length:7},(_,i)=>'band '+i)])if(!cases.has(c))failures.add('Missing branch: '+c);
const body=fs.readFileSync('scripts/as-physics-u7.draft.mjs','utf8').split('// BEGIN VERIFIED BODY')[1].split('// END VERIFIED BODY')[0],ast=ts.createSourceFile('draft.js',body,ts.ScriptTarget.Latest,true);let conditionalChecks=0;
function visit(node){if(ts.isConditionalExpression(node)){conditionalChecks++;assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Dead conditional');}ts.forEachChild(node,visit);}visit(ast);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:decimals,waveChecks,algebraChecks,conditionalChecks,failures:[...failures],variation:[...seen].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);assert.equal(seen.size,18);
if(production){const draft=createDraft(helpers.testHelpers);for(const tier of ['foundational','application','reasoning'])for(let i=0;i<1000;i++){const before=state,expected=draft(tier);state=before;assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');}
  assert.ok(compiled.supportsPhysicsUnit('as','as-u7'));
  if(!process.argv.includes('--before-enable'))assert.match(fs.readFileSync('app/page.tsx','utf8'),/id:"as-u7"[^\n]+available:true/);
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  console.log(`3,000 draft/production parity sets and registration checks passed. UI availability ${process.argv.includes('--before-enable')?'deferred until enablement':'check passed'}.`);
}
