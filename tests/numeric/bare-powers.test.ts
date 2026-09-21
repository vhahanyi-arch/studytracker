import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseQuantity,compareNumeric} from '@/lib/physics-marking-engine';
import {parseUnit,sameDimensions} from '@/lib/physics-marking-engine';


// Decimal literals and mantissa * 10**exponent may round to adjacent IEEE-754 values.
// This is a few machine-epsilon steps, not the much wider grading tolerance.
function assertWithinRoundoff(actual:number,expected:number){
 assert.ok(Number.isFinite(actual) && Number.isFinite(expected),'Values must be finite');
 if(expected===0){assert.equal(actual,0);return;}
 const tolerance=4*Number.EPSILON*Math.abs(expected);
 assert.ok(Math.abs(actual-expected)<=tolerance,`Expected ${expected}, got ${actual}; roundoff limit ${tolerance}`);
}
const rule=(accepted:string)=>({accepted:[accepted],unitRequired:true,relativeTolerance:0.005,absoluteTolerance:0,range:null});
for(const [input,value] of [
 ['10^-3',0.001],['10^6',1_000_000],['10^-3 m',0.001],['10^6 Hz',1_000_000],['10⁻³ m',0.001],['10⁶ Hz',1_000_000],
 ['10 ^ 3 m',1000],['10^(3) m',1000],['10^(-3) m',0.001],
 ['1×10^-3 m',0.001],['6.02 x 10^23 m',6.02e23],['10 m',10],['100 m',100],
] as const){
 test('base-ten quantity: '+input,()=>assertWithinRoundoff(parseQuantity(input).value,value));
}
for(let exponent=-30;exponent<=30;exponent++){
 for(const sign of new Set([String(exponent),exponent>=0?'+'+exponent:String(exponent)])){
  test('bare power both comparison directions '+exponent+' '+sign,()=>{
   const written='10 ^ '+sign+' m',numeric=(10**exponent)+' m';
   assert.equal(parseQuantity(written).value,10**exponent);
   assert.equal(compareNumeric(written,rule(numeric)).result,'match');
   assert.equal(compareNumeric(numeric,rule(written)).result,'match');
   assert.equal(compareNumeric((2*10**exponent)+' m',rule(written)).result,'miss');
  });
 }
}
for(const input of ['25^2','25^2 m','5² m','2^3 m','10^2^3 m','1*10^1^2 m','2*10^1^2 m','1e1^2 m','10^ m','10^2.5 m','10^999 m']){
 test('unresolved or malformed exponent must fail safely: '+input,()=>{
  assert.throws(()=>parseQuantity(input));
  assert.equal(compareNumeric(input,rule('10 m')).result,'review');
  assert.equal(compareNumeric('10 m',rule(input)).result,'review');
 });
}
test('fully evaluated non-base-ten working uses final result',()=>{
 assert.equal(parseQuantity('5² = 25 m').value,25);
});
test('unit exponent remains attached to the unit',()=>{
 const result=parseQuantity('10^6 m^2/s^2');
 assert.equal(result.value,1_000_000);
 assert.ok(sameDimensions(result.unit,parseUnit('m^2/s^2')));
});
test('unit numeral one is a reciprocal unit numerator',()=>{
 assert.equal(parseQuantity('10^6 1/s').value,1_000_000);
 assert.ok(sameDimensions(parseQuantity('10^6 1/s').unit,parseUnit('Hz')));
});
for(const unit of ['m^2^3','m^2.5','^2 m','m^','m^1e2']){
 test('unit parser consumes and validates all exponent tokens: '+unit,()=>assert.throws(()=>parseUnit(unit)));
}

test('roundoff assertion accepts adjacent representations of Avogadro-scale value',()=>{
 assertWithinRoundoff(6.019999999999999e23,6.02e23);
});
test('roundoff assertion rejects meaningful numeric errors at all tested scales',()=>{
 for(const expected of [6.02e23,0.001,1e-30]){
  for(const actual of [expected*10,expected*0.1,expected*1.000001,0]){
   assert.throws(()=>assertWithinRoundoff(actual,expected));
  }
 }
});
test('roundoff assertion rejects non-finite values and does not soften zero',()=>{
 for(const actual of [NaN,Infinity,-Infinity])assert.throws(()=>assertWithinRoundoff(actual,1));
 assert.throws(()=>assertWithinRoundoff(1e-30,0));
 assertWithinRoundoff(0,0);
});