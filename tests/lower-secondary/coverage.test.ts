import {test} from 'node:test';import assert from 'node:assert/strict';
import {stageUnits} from '@/lib/lower-secondary/units';
import {framework} from '@/lib/lower-secondary/framework';

// The audit that found 38 of 116 Stage 8 and 9 objectives untested, kept as a
// test: every framework objective must be assessed in its own unit, and in a
// tier that counts towards mastery. Reasoning sets are only served after a
// unit is mastered (app/api/lower-secondary/practice/route.ts), so an
// objective tested only there would never be required.

for(const objective of framework){
 test(`${objective.code} is assessed in ${objective.unit}: ${objective.summary}`,()=>{
  const templates=stageUnits[objective.unit]??[];
  const tagged=templates.filter(t=>t.codes.includes(objective.code));
  assert.ok(tagged.length>0,`no template in ${objective.unit} assesses ${objective.code}`);
  assert.ok(tagged.some(t=>t.tier!=='reasoning'),`${objective.code} is only assessed after mastery, in reasoning sets`);
 });
}
