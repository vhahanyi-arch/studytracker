import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMath } from '@/lib/physics-marking-engine';
import { compareNumeric } from '@/lib/physics-marking-engine';

const cases: [string, string][] = [
 ['10 ^ 3', '10^3'], ['10^(3)', '10^3'],
 ['10^(-3)', '10^-3'], ['10 ^ -3', '10^-3'],
 ['6.02 x 10 ^ 23', '6.02*10^23'], ['6.02 x 10^23', '6.02*10^23'],
 ['10', '10'], ['100', '100'], ['1000', '1000'], ['10, 20, 30', '10, 20, 30'],
 ['10(3)', '10^3'], ['10(+3)', '10^+3'],
 // Caret-free signed forms are a separate, deliberately signed compatibility path.
 ['4.5×10-3', '4.5*10^-3'], ['4.5□10+3', '4.5*10^+3'],
];
for (const [input, expected] of cases) {
 test('exponent normalization: '+input, () => assert.equal(normalizeMath(input), expected));
}
for (let exponent=0; exponent<=30; exponent++) {
 for (const suffix of [' ^ '+exponent, '^('+exponent+')', '('+exponent+')', ' ^ + '+exponent]) {
  test('unsigned/positive exponent '+suffix, () => {
   const input='6.02 x 10'+suffix+' N';
   assert.equal(normalizeMath(input), '6.02*10^'+(suffix.includes('+')?'+':'')+exponent+' N');
   const rule={accepted:['6.02e'+exponent+' N'],unitRequired:true,relativeTolerance:0.005,absoluteTolerance:0,range:null};
   assert.equal(compareNumeric(input,rule).result,'match');
   assert.equal(compareNumeric(rule.accepted[0],{...rule,accepted:[input]}).result,'match');
  });
 }
}
