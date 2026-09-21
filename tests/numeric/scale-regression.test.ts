import {test} from 'node:test';import assert from 'node:assert/strict';import {compareNumeric} from '@/lib/physics-marking-engine';
for(const exponent of [-34,-27,-19,-12,-6,0,6,12,20])test('relative tolerance remains meaningful at 1e'+exponent,()=>{
 const n=10**exponent,rule={accepted:[n+' J'],unitRequired:true,relativeTolerance:.005,absoluteTolerance:0,range:null};
 assert.equal(compareNumeric(n+' J',rule).result,'match');
 assert.equal(compareNumeric(n*2+' J',rule).result,'miss');
 assert.equal(compareNumeric('0 J',rule).result,'miss');
});
