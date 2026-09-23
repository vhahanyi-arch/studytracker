import {test} from 'node:test';import assert from 'node:assert/strict';
import {gcd,lcm,isPrime,primeFactors,primeIndexForm,primeProductForm,frac,add,sub,mul,div,fracStr,mixedStr,fromMixed,terminates,tidyNum,fmt,ans,money,br,plural,an,linear,typed,distinct,sup,supToCaret,terms,exprForms,factorForms,poly,roundSF,roundDP,big} from '@/lib/lower-secondary/kit';

test('gcd and lcm',()=>{
 assert.equal(gcd(24,36),12);assert.equal(gcd(-8,12),4);assert.equal(gcd(7,13),1);
 assert.equal(lcm(6,8),24);assert.equal(lcm(4,6),12);
});

test('primes',()=>{
 assert.deepEqual([2,3,4,9,17,21,1].map(isPrime),[true,true,false,false,true,false,false]);
 assert.deepEqual(primeFactors(60),[2,2,3,5]);assert.deepEqual(primeFactors(97),[97]);
});

test('prime factorisation is written both ways',()=>{
 assert.equal(primeIndexForm(360),'2³ × 3² × 5');
 assert.equal(primeProductForm(60),'2 × 2 × 3 × 5');
 assert.equal(primeIndexForm(7),'7');
});

test('fractions are stored simplified with a positive denominator',()=>{
 assert.deepEqual(frac(6,8),{n:3,d:4});assert.deepEqual(frac(3,-4),{n:-3,d:4});assert.deepEqual(frac(0,5),{n:0,d:1});
});

test('fraction arithmetic is exact',()=>{
 assert.deepEqual(add(frac(1,3),frac(1,6)),{n:1,d:2});
 assert.deepEqual(sub(frac(1,4),frac(3,4)),{n:-1,d:2});
 assert.deepEqual(mul(frac(2,3),frac(9,4)),{n:3,d:2});
 assert.deepEqual(div(frac(3,5),frac(9,10)),{n:2,d:3});
});

test('a zero denominator is refused',()=>{assert.throws(()=>frac(1,0));});

test('fractions print simply, with a true minus sign',()=>{
 assert.equal(fracStr(frac(6,8)),'3/4');assert.equal(fracStr(frac(-3,4)),'−3/4');assert.equal(fracStr(frac(8,4)),'2');
});

test('mixed numbers',()=>{
 assert.equal(mixedStr(frac(7,3)),'2 1/3');assert.equal(mixedStr(frac(6,3)),'2');
 assert.equal(mixedStr(frac(2,3)),'2/3');assert.equal(mixedStr(frac(-7,3)),'−2 1/3');
 assert.deepEqual(fromMixed(2,1,3),{n:7,d:3});
});

// A denominator whose only prime factors are 2 and 5 gives a terminating decimal.
test('terminating and recurring decimals',()=>{
 assert.equal(terminates(frac(3,8)),true);assert.equal(terminates(frac(7,20)),true);
 assert.equal(terminates(frac(1,3)),false);assert.equal(terminates(frac(5,12)),false);
 assert.equal(terminates(frac(3,6)),true,'simplifies to 1/2 first');
});

test('floating-point noise is removed',()=>{
 assert.equal(tidyNum(0.1+0.2),0.3);assert.equal(fmt(0.1+0.2),'0.3');assert.equal(ans(1.1*3),'3.3');
});

test('negatives print with a true minus sign, answers with a hyphen',()=>{
 assert.equal(fmt(-4.5),'−4.5');assert.equal(ans(-4.5),'-4.5');assert.equal(fmt(-0),'0');
});

test('money keeps two decimal places',()=>{
 assert.equal(money(4.5),'4.50');assert.equal(money(12),'12.00');assert.equal(money(3.456),'3.46');assert.equal(money(0.1+0.2),'0.30');
});

test('negatives are bracketed inside expressions',()=>{assert.equal(br(-3),'(−3)');assert.equal(br(3),'3');});

test('plurals agree with their number',()=>{
 assert.equal(plural(1,'hour'),'1 hour');assert.equal(plural(3,'hour'),'3 hours');assert.equal(plural(2,'box','boxes'),'2 boxes');
});

test('the article agrees with the word',()=>{
 assert.deepEqual(['equilateral','isosceles','octagon','regular','unit','uniform','one','8-sided','11-sided','hexagon'].map(an),
  ['an','an','an','a','a','a','a','an','an','a']);
});

test('linear expressions read naturally',()=>{
 assert.equal(linear(3,-2),'3x − 2');assert.equal(linear(1,0),'x');assert.equal(linear(-1,4),'−x + 4');
 assert.equal(linear(0,5),'5');assert.equal(linear(0,0),'0');assert.equal(linear(frac(1,2),3,'n'),'1/2n + 3');
});

test('typed form drops spaces and true minus signs',()=>{assert.equal(typed('3x − 2'),'3x-2');});

test('distinct values really are distinct',()=>{
 for(let i=0;i<200;i++){const v=distinct(4,1,6);assert.equal(new Set(v).size,4);}
 assert.throws(()=>distinct(5,1,3));
});

test('superscripts',()=>{assert.equal(sup(23),'²³');assert.equal(sup(-1),'⁻¹');});

test('significant figures, including ties the float representation hides',()=>{
 assert.equal(roundSF(0.0045,1),0.005,'0.0045 is stored as 0.00449999...');
 assert.equal(roundSF(1846213,2),1800000);assert.equal(roundSF(45672,3),45700);
 assert.equal(roundSF(0.004568,2),0.0046);assert.equal(roundSF(3.4449,2),3.4);
 assert.equal(roundSF(-2.35,2),-2.4,'halves go away from zero');assert.equal(roundSF(999,1),1000);
});

test('decimal places, with the same care over ties',()=>{
 assert.equal(roundDP(2.675,2),2.68,'2.675 is stored as 2.67499999...');assert.equal(roundDP(7.3862,2),7.39);assert.equal(roundDP(1.005,2),1.01);
});

test('large numbers group in threes',()=>{
 assert.equal(big(1846213),'1 846 213');assert.equal(big(4567),'4567');assert.equal(big(45672),'45 672');assert.equal(big(-12345.5),'−12 345.5');
});

test('polynomials read naturally',()=>{
 assert.equal(poly([3,-2,0]),'3x² − 2x');assert.equal(poly([1,0,-4]),'x² − 4');assert.equal(poly([-1,1]),'−x + 1');
 assert.equal(poly([0,0,0]),'0');assert.equal(poly([2,0,0,5],'n'),'2n³ + 5');assert.equal(poly([0,-1,0]),'−x');
});

test('an expression splits into signed top-level terms',()=>{
 assert.deepEqual(terms('3x² − 2x + 5'),['+3x²','-2x','+5']);
 assert.deepEqual(terms('−x + 4'),['-x','+4']);
 assert.deepEqual(terms('2(x − 1) + 3'),['+2(x-1)','+3'],'a bracket is one term');
});

test('every term order and both power notations are accepted',()=>{
 assert.deepEqual(exprForms('3x² − 2x').sort(),['-2x+3x^2','-2x+3x²','3x^2-2x','3x²-2x'].sort());
 assert.ok(exprForms('5n − 3').includes('-3+5n'));
 assert.equal(exprForms('7').length,1);
 assert.equal(exprForms('a + b + c').length,6);
});

test('a factorised form accepts its bracket in either order',()=>{
 const f=factorForms('3x','2x + 3');
 assert.ok(f.includes('3x(2x+3)')&&f.includes('3x(3+2x)'));
});

test('superscript powers convert to caret form',()=>{
 assert.equal(supToCaret('2³ × 3² × 5'),'2^3 × 3^2 × 5');assert.equal(supToCaret('7¹²'),'7^12');assert.equal(supToCaret('9'),'9');
});
