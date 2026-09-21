import {test} from 'node:test';import assert from 'node:assert/strict';
import {compareNumeric} from '@/lib/physics-marking-engine';
const rule={accepted:['F = ma = 5 × 2 = 10 N'],unitRequired:true,relativeTolerance:.005,absoluteTolerance:0,range:null};
const cases:[string,string][]=[['10 N','match'],['0.01 kN','match'],['10000 mN','match'],['9.99 N','match'],['10.05 N','match'],['10.06 N','miss'],['10 kg','miss'],['10','miss'],['-10 N','miss'],['not sure','review'],['10 or 11 N','review'],['NaN','review'],['1e999 N','review'],['10 N extra','review']];
for(const [answer,result] of cases)test(answer+' => '+result,()=>assert.equal(compareNumeric(answer,rule).result,result));
test('optional units',()=>assert.equal(compareNumeric('10',{...rule,unitRequired:false}).result,'match'));
test('optional units still reject wrong units',()=>assert.equal(compareNumeric('10 J',{...rule,unitRequired:false}).result,'miss'));
test('rounded pi',()=>assert.equal(compareNumeric('3.14',{...rule,unitRequired:false,accepted:['3.142']}).result,'match'));
test('ambiguous scheme must review',()=>assert.equal(compareNumeric('10 N',{...rule,accepted:['10 or 20 N']}).result,'review'));
test('explicit range endpoints',()=>{for(const n of [9.7,9.8,9.9])assert.equal(compareNumeric(n+' N',{...rule,range:[9.7,9.9]}).result,'match');});
test('explicit range no added relative tolerance',()=>assert.equal(compareNumeric('9.91 N',{...rule,range:[9.7,9.9]}).result,'miss'));
test('zero no relative tolerance loophole',()=>assert.equal(compareNumeric('0.001 N',{...rule,accepted:['0 N']}).result,'miss'));
test('explicit absolute tolerance',()=>assert.equal(compareNumeric('0.001 N',{...rule,accepted:['0 N'],absoluteTolerance:.002}).result,'match'));
for(let n=1;n<=200;n++){test('generated conversion '+n,()=>assert.equal(compareNumeric(n*1000+' mN',{...rule,accepted:[n+' N']}).result,'match'));test('generated miss '+n,()=>assert.equal(compareNumeric(n*1.1+' N',{...rule,accepted:[n+' N']}).result,'miss'));}
