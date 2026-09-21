import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMath, finalExpression } from '@/lib/physics-marking-engine';
import { compareNumeric } from '@/lib/physics-marking-engine';

const unchanged = [
 'y = 10 - 3', 'R = 10 - 3', 'T = 10 -3', '10-3',
 'v = u - at = 10 - 3 = 7', '10 + 3', 'R = 10 +3',
];
for (const input of unchanged) test('preserve arithmetic: '+input, () => {
 assert.equal(normalizeMath(input), input);
});
for (const spaces of [' ', '  ', '   ', '\t', '\u00a0\u00a0']) {
 for (const sign of ['-', '+', '−']) {
  test('spaces before arithmetic sign '+JSON.stringify(spaces)+sign, () => {
   const input='v = 10'+spaces+sign+'3';
   assert.equal(normalizeMath(input), 'v = 10 '+(sign==='−'?'-':sign)+'3');
  });
 }
}
for (const input of ['4.5×10-3','4.5x10-3','4.5 * 10-3','4.5×10⁻³','4.5□10−3']) {
 test('keep scientific repair: '+input, () => {
  assert.match(normalizeMath(input), /^4\.5\s*\*\s*10\^-3$/);
  assert.equal(compareNumeric(input+' N', {accepted:['0.0045 N'],unitRequired:true,relativeTolerance:0,absoluteTolerance:0,range:null}).result,'match');
 });
}
for (const [input,expected] of [['10 ^ 3','10^3'],['10^(-3)','10^-3'],['100','100']]) {
 test('earlier exponent fix: '+input, () => assert.equal(normalizeMath(input),expected));
}
const rule={accepted:['v = u - at = 10 - 3 = 7 m/s'],unitRequired:true,relativeTolerance:0.005,absoluteTolerance:0,range:null};
test('complete derivation preserves subtraction and extracts final seven',()=>{
 assert.equal(normalizeMath(rule.accepted[0]),rule.accepted[0]);
 assert.equal(finalExpression(rule.accepted[0]),'7 m/s');
 assert.equal(compareNumeric('7 m/s',rule).result,'match');
 assert.equal(compareNumeric('0.01 m/s',rule).result,'miss');
 assert.equal(compareNumeric('0.001 m/s',rule).result,'miss');
 assert.equal(compareNumeric(rule.accepted[0],{...rule,accepted:['7 m/s']}).result,'match');
});
test('multiline student working preserves subtraction',()=>{
 const working='v = u - at\nv = 10 - 3\nv = 7 m/s';
 assert.equal(finalExpression(working),'7 m/s');
 assert.equal(compareNumeric(working,rule).result,'match');
});
test('unresolved subtraction is review, not a guessed scalar, on either side',()=>{
 for(const expression of ['10-3 m/s','v = 10 - 3 m/s','v = 10  -3 m/s']){
  assert.equal(compareNumeric(expression,rule).result,'review');
  assert.equal(compareNumeric('7 m/s',{...rule,accepted:[expression]}).result,'review');
 }
});

// Genuine Cambridge 9702/02 specimen (2022), mark scheme page 7, Q2(c)(i).
// Visually checked against https://www.cambridgeinternational.org/Images/554371-2022-specimen-paper-2-mark-scheme.pdf
// This subtraction alternative and the separately printed final answer are joined as working lines.
// Fraction notation is transcribed as 1/2; no embedded PDF text is used as a numeric oracle.
test('official Cambridge subtraction derivation gives positive 3.7 m',()=>{
 const scheme='s = 0 − 1/2 × (−9.81) × 0.87²\ns = 3.7 m';
 const expected={...rule,accepted:[scheme]};
 assert.ok(normalizeMath(scheme).includes('s = 0 - 1/2'));
 assert.equal(finalExpression(scheme),'3.7 m');
 assert.equal(compareNumeric('3.7 m',expected).result,'match');
 assert.equal(compareNumeric('0.0037 m',expected).result,'miss');
 assert.equal(compareNumeric(scheme,{...expected,accepted:['3.7 m']}).result,'match');
});
