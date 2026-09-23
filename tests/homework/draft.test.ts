import {test} from 'node:test';import assert from 'node:assert/strict';
import {calculateExpression,simplifyHomeworkRatio,simplifyLinearTerms,generateHomeworkDraftFromText as draft} from '@/lib/homework-draft';

// These drafts are what a teacher sees as the proposed marking answer for a
// homework page. A "high" draft also becomes the accepted answer, so a wrong
// confident draft marks a right student answer wrong.

// ── calculateExpression ────────────────────────────────────────────────────
test('multiplication binds tighter than addition',()=>{
 assert.equal(calculateExpression('2 + 3 × 4'),'14');
 assert.equal(calculateExpression('(2+3)×4'),'20');
});
test('powers are right-associative',()=>{
 assert.equal(calculateExpression('2^3^2'),'512');
});
test('the symbols printed in textbooks are read as operators',()=>{
 assert.equal(calculateExpression('7 ÷ 2'),'3.5');
 assert.equal(calculateExpression('10 − 4'),'6');
 assert.equal(calculateExpression('3 x 4'),'12');
});
test('a leading minus negates',()=>{
 assert.equal(calculateExpression('-3 + 5'),'2');
 assert.equal(calculateExpression('2--3'),'5');
});
// 0.1 + 0.2 is 0.30000000000000004 in floating point.
test('float noise is removed from decimal answers',()=>{
 assert.equal(calculateExpression('0.1 + 0.2'),'0.3');
});
test('anything that is not a complete calculation gives no answer',()=>{
 for(const e of ['','2 + y','(2+3','2+','2 × (3'])assert.equal(calculateExpression(e),null,e);
});
// Returning the part that did parse would draft a confident wrong answer.
test('a calculation with anything left over gives no answer',()=>{
 for(const e of ['(2+3))','2(3)','4 × 5)'])assert.equal(calculateExpression(e),null,e);
});
test('an infinite or absurdly large result gives no answer',()=>{
 assert.equal(calculateExpression('1/0'),null);
 assert.equal(calculateExpression('10^13'),null);
 assert.equal(calculateExpression('10^12'),'1000000000000');
});

// ── simplifyHomeworkRatio ──────────────────────────────────────────────────
test('a ratio is divided by its highest common factor',()=>{
 assert.equal(simplifyHomeworkRatio(12,18),'2:3');
 assert.equal(simplifyHomeworkRatio(5,7),'5:7');
});
test('a ratio with a zero or a decimal part is left alone',()=>{
 assert.equal(simplifyHomeworkRatio(0,4),null);
 assert.equal(simplifyHomeworkRatio(1.5,3),null);
});

// ── simplifyLinearTerms ────────────────────────────────────────────────────
test('like terms are collected',()=>{
 assert.equal(simplifyLinearTerms('3x + 2x'),'5x');
 assert.equal(simplifyLinearTerms('3x + 4 - x + 1'),'2x+5');
 assert.equal(simplifyLinearTerms('0.5x + 0.25x'),'0.75x');
});
test('a coefficient of one or minus one is not written',()=>{
 assert.equal(simplifyLinearTerms('x + x'),'2x');
 assert.equal(simplifyLinearTerms('4x - 3x'),'x');
 assert.equal(simplifyLinearTerms('2x - 3x'),'-x');
 assert.equal(simplifyLinearTerms('-x + 3'),'-x+3');
});
test('terms that cancel leave zero',()=>{
 assert.equal(simplifyLinearTerms('x - x'),'0');
 assert.equal(simplifyLinearTerms('4 - 4 + x - x'),'0');
});
test('only expressions in x are simplified',()=>{
 assert.equal(simplifyLinearTerms('3 + 4'),null);
 assert.equal(simplifyLinearTerms('3y + 2y'),null);
 assert.equal(simplifyLinearTerms('3x + 2y'),null);
});

// ── generateHomeworkDraftFromText ──────────────────────────────────────────
const confident=(text:string,answer:string)=>{
 const d=draft(text);
 assert.equal(d.confidence,'high',text);
 assert.equal(d.acceptedAnswer,answer,text);
};
test('a single calculation is drafted with confidence',()=>{
 const d=draft('1. Work out 12 + 30');
 assert.deepEqual(d,{answer:'1. 12 + 30 = 42',acceptedAnswer:'42',confidence:'high'});
});
test('each kind of direct question is recognised',()=>{
 confident('1. Find 15% of 80','12');
 confident('1. Solve 3x + 4 = 19','5');
 confident('1. Solve x - 2 = 7','9');
 confident('1. Simplify 3x + 2x','5x');
 confident('1. Write the ratio 12 : 18 in its simplest form','2:3');
 confident('1. Round 4567 to the nearest hundred','4600');
 confident('1. Round 4567 to the nearest thousand','5000');
 confident('1. Find the mean of 4 and 8','6');
 confident('1. The position-to-term rule is multiply by 3 then add 2. Write the first five terms.','5, 8, 11, 14, 17');
 confident('1. The term rule is multiply by 2 then subtract 1. Write the first five terms.','1, 3, 5, 7, 9');
});
test('a mean uses every number in the list',()=>{
 confident('1. Find the mean of 4, 8 and 12','8');
 confident('1. Work out the average of 2, 4, 6 and 8','5');
 confident('1. Find the mean of -2, 0 and 5.5','1.16666667');
});
test('a ratio already in its simplest form is not offered as a simplification',()=>{
 assert.equal(draft('1. Write the ratio 5 : 7 in its simplest form').confidence,'review');
});
test('OCR symbols are normalised before reading',()=>{
 confident('1. Work out 5²','25');
 confident('1. Work out 2³','8');
 confident('1. Work out 12 − 20','-8');
});
// Worked examples printed above the exercise must not be drafted as answers.
test('reading starts at the first numbered exercise',()=>{
 confident('Example 1 + 1\n1. Work out 12 + 30','42');
});
test('the same calculation found twice is listed once',()=>{
 confident('1. Find 15% of 80. Check: 15% of 80','12');
});
test('several results on one exercise need checking, so none is accepted',()=>{
 assert.deepEqual(draft('1. Work out 2 + 3 and 4 × 5'),{answer:'1. 2 + 3 = 5\n2. 4 × 5 = 20',acceptedAnswer:null,confidence:'medium'});
});
test('a drawing task is held for the teacher',()=>{
 const d=draft('1. Draw a triangle with sides of 5 cm');
 assert.equal(d.confidence,'review');assert.equal(d.acceptedAnswer,null);
 assert.match(d.answer,/^Visual or construction task detected/);
 assert.match(d.answer,/Draw a triangle with sides of 5 cm/);
});
// A calculation inside a drawing task is only part of the answer.
test('a calculation inside a drawing task is not accepted automatically',()=>{
 const d=draft('1. Plot the point (2, 3 + 4)');
 assert.equal(d.confidence,'review');assert.equal(d.acceptedAnswer,null);
});
test('a written-reasoning task is held for the teacher',()=>{
 const d=draft('1. Explain why every square is a rectangle');
 assert.equal(d.confidence,'review');assert.equal(d.acceptedAnswer,null);
 assert.match(d.answer,/reliable automatic solution was not produced/);
});
test('a page of numbered exercises is drafted exercise by exercise',()=>{
 const d=draft('1 Work out 2 + 3\n2 Work out 4 × 5');
 assert.equal(d.confidence,'medium');assert.equal(d.acceptedAnswer,null);
 assert.equal(d.answer,'Question 1 · Automatic draft\n1. 2 + 3 = 5\n\nQuestion 2 · Automatic draft\n1. 4 × 5 = 20\n\nCoverage check: 2 numbered exercises were detected and all are listed above. Check each result before approval.');
});
test('an exercise on the page that needs review holds the whole page',()=>{
 const d=draft('1 Work out 2 + 3\n2 Draw a square with sides of 4 cm');
 assert.equal(d.confidence,'review');
 assert.match(d.answer,/Question 2 · Teacher review required/);
 assert.match(d.answer,/1 need teacher input before this page is used for automatic practice\.$/);
});
test('the same exercise number twice in a row is one exercise',()=>{
 const d=draft('1 Work out 2 + 3\n1 Work out 2 + 3\n2 Work out 4 × 5');
 assert.match(d.answer,/Coverage check: 2 numbered exercises/);
});
