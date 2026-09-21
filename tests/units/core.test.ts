import {test} from 'node:test';import assert from 'node:assert/strict';
import {parseUnit,sameDimensions} from '@/lib/physics-marking-engine';
import {compareNumeric} from '@/lib/physics-marking-engine';
const units=['N','kg m s⁻²','kg·m·s⁻²','kg.m/s²','kg m/s^2','kg*m*s^-2','kg*m/(s^2)','kg m s-2'];
for(let n=1;n<=100;n++)for(const unit of units)test('force units '+n+' '+unit,()=>{
 assert.equal(compareNumeric(n+' '+unit,{accepted:[n+' N'],unitRequired:true,relativeTolerance:0,absoluteTolerance:0,range:null}).result,'match');
});
const pairs=[['J','N*m'],['W','J/s'],['V','W/A'],['Ω','V/A'],['Pa','N/m^2'],['C','A*s'],['F','C/V'],['T','N/(A*m)'],['Wb','V*s'],['Hz','1/s']];
for(const [a,b] of pairs)test('dimensions '+a+' = '+b,()=>assert.ok(sameDimensions(parseUnit(a),parseUnit(b))));
test('prefix scaling',()=>assert.equal(parseUnit('kN').scale,1000));
test('squared prefix scaling',()=>assert.equal(parseUnit('cm²').scale,.0001));
test('case sensitive prefixes',()=>assert.notEqual(parseUnit('mN').scale,parseUnit('MN').scale));
test('incompatible dimension',()=>assert.ok(!sameDimensions(parseUnit('N'),parseUnit('J'))));
for(const bad of ['banana','m//s','m/(s','m^','m^1.5','°C'])test('unsupported unit '+bad,()=>assert.throws(()=>parseUnit(bad)));
