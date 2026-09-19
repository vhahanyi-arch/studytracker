import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createDraft} from './as-physics-u1.draft.mjs';

const production = process.argv.includes('--production');
const iterations = Number(process.argv.find(x=>/^--iterations=/.test(x))?.split('=')[1] || 3000);
let state = 97022027;
const random = () => {state = (Math.imul(state,1664525)+1013904223)>>>0; return state/2**32;};
const source = fs.readFileSync('lib/physics-question-engine.ts','utf8');
const js = ts.transpileModule(source+'\nexport const testHelpers = {sq,r,validateUnitSet};', {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const exports = {};
vm.runInNewContext(js,{exports,Math:Object.assign(Object.create(Math),{random})});
const compiled = {};
if(production) vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports:compiled,Math:Object.assign(Object.create(Math),{random})});
const generate = production ? tier=>compiled.makePhysicsQuestions('as','as-u1',tier) : createDraft(exports.testHelpers);
const syllabus = JSON.parse(fs.readFileSync('lib/as-physics-syllabus.json','utf8'));
const objectives = new Set(syllabus.topics[0].groups.flatMap(g=>g.objectives.map(o=>o.id)));
const coverage = new Set(), observed = new Map(), ugly = /\d+\.\d{5,}/;
const failures = new Set();
let questions = 0;
const options = prompt => [...prompt.matchAll(/\(([a-d])\) (.*?)(?= \([a-d]\) |$)/g)];
const numbers = text => (text.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
function oracle(q) {
  const p=q.prompt, a=q.answers[0], n=numbers(p);
  const pick=options(p), chosen=pick.find(x=>x[1]===a)?.[2];
  const close = expected => assert.ok(Math.abs(Number(a)-expected)<1e-9,`${q.templateId}: ${a} != ${expected}`);
  switch(q.templateId) {
    case 'as-u1-f1': assert.equal(chosen,`${n[0]}; ${/recorded as \d+ (m|s)\./.exec(p)[1]}`); break;
    case 'as-u1-f2': assert.equal(chosen,p.includes('height')?'1.7 m':'70 kg'); break;
    case 'as-u1-f3': assert.equal(a,{mass:'kilogram',length:'metre',time:'second',current:'ampere',temperature:'kelvin'}[/unit for (\w+)/.exec(p)[1]]); break;
    case 'as-u1-f4': assert.equal(chosen,{force:'kg m s^-2',energy:'kg m^2 s^-2',pressure:'kg m^-1 s^-2',power:'kg m^2 s^-3'}[/expression for (\w+)/.exec(p)[1]]); break;
    case 'as-u1-f5': close({pico:-12,nano:-9,micro:-6,milli:-3,centi:-2,deci:-1,kilo:3,mega:6,giga:9,tera:12}[/prefix (\w+)/.exec(p)[1]]); break;
    case 'as-u1-f6': assert.equal(a,/mass|energy|speed/.test(p)?'scalar':'vector'); break;
    case 'as-u1-a1': assert.equal(a,p.includes('t^2')?'false':'true'); break;
    case 'as-u1-a2': close(n[1]+(p.includes('too high')?-n[0]:n[0])); assert.ok(Number(a)>0); break;
    case 'as-u1-a3': close(n[1]+n[3]); break;
    case 'as-u1-a4': close(Math.hypot(n[0],n[1])); break;
    case 'as-u1-a5': close(n[0]*(p.includes('horizontal component')?0.5:0.866)); assert.ok(Number(a)<=n[0]); break;
    case 'as-u1-a6': assert.equal(chosen,Math.abs(n[2]-n[0])<1?'precise and accurate':'precise but inaccurate'); break;
    case 'as-u1-r1': assert.equal(chosen,p.includes('E = 0.5')?'The formula is correct, but dimensions alone cannot establish its coefficient.':'The coefficient is wrong even though the units match energy.'); break;
    case 'as-u1-r2': close(n[0]/n[1]*10); break;
    case 'as-u1-r3': assert.equal(chosen,p.includes('unpredictable')?'Averaging reduces this random uncertainty, but does not make the result exact.':'The fixed offset survives averaging; correct or recalibrate the timer.'); break;
    case 'as-u1-r4': { const match=/m = (\d+) kg with (\d+)% uncertainty and v = (\d+) m\/s with (\d+)%/.exec(p); const [m,dm,v,dv]=match.slice(1).map(Number); close(0.5*m*v*v*(dm/100+2*dv/100)); assert.ok(Number(a)>0 && Number(a)<0.5*m*v*v); break; }
    case 'as-u1-r5': { const expected=[n[0]-n[2],n[1]-n[3]]; assert.deepEqual(numbers(a),expected); assert.equal(exports.answerMatches(expected.join(', '),q.answers),true); assert.equal(exports.answerMatches(expected.join(''),q.answers),false,'Missing component delimiter accepted'); assert.equal(exports.answerMatches('nonsense '+a,q.answers),false,'Junk accepted as ordered answer'); if(expected[0]!==expected[1]) assert.equal(exports.answerMatches([...expected].reverse().join(', '),q.answers),false); break; }
    case 'as-u1-r6': close(n[0]*(p.includes('correct east')?0.6:0.8)); break;
    default: assert.fail(q.templateId);
  }
  return chosen??a;
}
for (const tier of ['foundational','application','reasoning']) {
  for(let i=0;i<iterations;i++) {
    const set=generate(tier);
    assert.equal(set.length,6);
    assert.equal(new Set(set.map(q=>q.prompt)).size,6);
    for(const q of set) {
      questions++;
      assert.ok(objectives.has(q.objective)); coverage.add(q.objective);
      assert.equal(q.difficulty,tier);
      assert.ok(q.hint && q.solution && q.answerFormat && q.templateId);
      assert.ok(!ugly.test([q.prompt,...q.answers,q.solution].join(' ')),q.templateId+' ugly decimal');
      assert.ok(!/NaN|Infinity|undefined/.test(JSON.stringify(q)));
      for(const a of q.answers) assert.ok(exports.answerMatches(a,q.answers));
      try {
        const semantic=oracle(q);
        if(!observed.has(q.templateId)) observed.set(q.templateId,{prompts:new Set(),answers:new Set()});
        observed.get(q.templateId).prompts.add(q.prompt); observed.get(q.templateId).answers.add(semantic);
      } catch(e) { failures.add(e.message); }
    }
  }
}
assert.deepEqual([...coverage].sort(),[...objectives].sort());
for(const [id,seen] of observed) if(seen.answers.size<2) failures.add(`${id}: randomization does not vary the semantic answer`);
console.log(JSON.stringify({mode:production?'compiled production':'draft',iterationsPerTier:iterations,sets:iterations*3,questions,objectivesCovered:coverage.size,uglyDecimals:0,failures:[...failures],variation:[...observed].map(([id,s])=>({id,prompts:s.prompts.size,answers:s.answers.size}))},null,2));
assert.equal(failures.size,0);

// Guard mutations catch omissions in the actual shared validator.
const sample=generate('foundational'), validate=exports.testHelpers.validateUnitSet;
assert.throws(()=>validate(sample.slice(1),'foundational'));
assert.throws(()=>validate([...sample,sample[0]],'foundational'));
for(const field of ['objective','templateId','hint','solution','prompt']) {
  assert.throws(()=>validate([{...sample[0],[field]:''},...sample.slice(1)],'foundational'));
}
assert.throws(()=>validate([{...sample[0],answers:[]},...sample.slice(1)],'foundational'));
assert.throws(()=>validate([{...sample[0],answers:[' ']},...sample.slice(1)],'foundational'));
assert.throws(()=>validate([{...sample[0],difficulty:'reasoning'},...sample.slice(1)],'foundational'));
assert.throws(()=>validate([sample[0],{...sample[1],prompt:sample[0].prompt},...sample.slice(2)],'foundational'));
assert.throws(()=>validate([sample[0],{...sample[1],templateId:sample[0].templateId},...sample.slice(2)],'foundational'));
assert.ok(exports.answerMatches('100.09',['100']));
assert.ok(!exports.answerMatches('100.11',['100']));
assert.ok(exports.answerMatches('north, south',['north,south']));
assert.ok(!exports.answerMatches('south, north',['north,south']));
console.log('12 validator rejection checks and 4 marking compatibility checks passed.');
if(production) {
  const draft = createDraft(exports.testHelpers);
  for(const tier of ['foundational','application','reasoning']) for(let i=0;i<1000;i++) {
    const before=state, expected=draft(tier); state=before;
    assert.equal(JSON.stringify(generate(tier)),JSON.stringify(expected),'Draft/production drift');
  }
  assert.ok(compiled.supportsPhysicsUnit('as','as-u1'));
  assert.ok(!compiled.supportsPhysicsUnit('as','as-u9999'));
  assert.throws(()=>compiled.makePhysicsQuestions('as','as-u9999','foundational'));
  const page=fs.readFileSync('app/page.tsx','utf8');
  assert.match(page,/id:"as-u1"[^\n]+available:true/);
  console.log('3,000 draft/production parity sets and AS registration/UI checks passed.');
}
