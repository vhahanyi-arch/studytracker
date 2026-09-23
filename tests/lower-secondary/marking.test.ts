import {test} from 'node:test';import assert from 'node:assert/strict';
import {answerMatches} from '@/lib/lower-secondary-question-engine';

// answerMatches marks every Stage 7-9 practice answer. It had no tests.

test('spacing, case and minus-sign style do not matter',()=>{
 assert.ok(answerMatches(' -12 ',['−12']));assert.ok(answerMatches('3X + 2',['3x+2']));assert.ok(answerMatches('3x+2',['3x + 2']));
});

test('numbers compare by value',()=>{
 assert.ok(answerMatches('8.50',['8.5']));assert.ok(answerMatches('0.30',['0.3']));assert.ok(!answerMatches('8.6',['8.5']));
});

test('a wrong answer is wrong',()=>{assert.ok(!answerMatches('13',['12']));assert.ok(!answerMatches('',['12']));});

// Before the fix, tidy() stripped the space and "2 1/3" became "21/3".
test('a mixed number is not confused with an improper fraction',()=>{
 assert.ok(answerMatches('2 1/3',['2 1/3']));
 assert.ok(answerMatches('2  1/3',['2 1/3']));
 assert.ok(!answerMatches('21/3',['2 1/3']),'twenty-one thirds is 7, not 2 1/3');
 assert.ok(!answerMatches('2 1/3',['21/3']));
});

test('ordered lists compare their numbers in order',()=>{
 assert.ok(answerMatches('-7, -2, 0, 3',['-7,-2,0,3']));assert.ok(answerMatches('−7 < −2 < 0 < 3',['-7,-2,0,3']));
 assert.ok(!answerMatches('3, 0, -2, -7',['-7,-2,0,3']));
});

test('coordinates compare in order',()=>{assert.ok(answerMatches('(5, 3)',['(5,3)']));assert.ok(!answerMatches('(3,5)',['(5,3)']));});
