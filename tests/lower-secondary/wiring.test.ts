import {test} from 'node:test';import assert from 'node:assert/strict';
import {makeUnitQuestions,supportsMasteryUnit,answerMatches} from '@/lib/lower-secondary-question-engine';
import {framework} from '@/lib/lower-secondary/framework';

// The practice route serves every Stage 8 and 9 unit through makeUnitQuestions.
// These check what a student actually receives, not just the templates.

const units=[...new Set(framework.map(o=>o.unit))];
const tiers=['foundational','application','reasoning'];

test('every Stage 8 and 9 unit is served by the framework engine',()=>{
 for(const unit of units){
  assert.ok(supportsMasteryUnit(unit),unit);
  for(const tier of tiers){
   const set=makeUnitQuestions(unit,tier);
   assert.equal(set.length,6,`${unit} ${tier}`);
   for(const q of set){
    assert.ok(q.templateId?.startsWith(`${unit}-`),`${unit} served ${q.templateId}`);
    assert.equal(q.difficulty,tier);
    assert.ok(q.codes&&q.codes.length>0,`${q.templateId} has no framework codes`);
    assert.ok(answerMatches(q.answers[0],q.answers),`${q.templateId}: its own answer does not mark as correct`);
   }
  }
 }
});

test('Stage 7 integers keeps its own question set and ids',()=>{
 for(const tier of tiers){
  const set=makeUnitQuestions('s7-integers',tier);
  assert.equal(set.length,6);
  for(const q of set){assert.match(String(q.templateId),/^s7-integers-[far]\d$/);assert.ok(answerMatches(q.answers[0],q.answers));}
 }
});

test('units without an engine are refused',()=>{
 assert.ok(!supportsMasteryUnit('s8-u17'));assert.ok(!supportsMasteryUnit('s7-integers'),'Stage 7 is gated by the route, not here');
 assert.throws(()=>makeUnitQuestions('s8-u17','foundational'));
});
