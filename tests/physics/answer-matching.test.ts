import {test} from 'node:test';import assert from 'node:assert/strict';
import {answerMatches,answerFormatFor,expectedAnswerText,makePhysicsQuestions,type PhysicsQuestion} from '@/lib/physics-question-engine';
import {markPracticeSet} from '@/lib/practice-sessions';

// answerMatches marks IGCSE and AS physics practice. The answer box invites a
// unit, but "7 m/s²" for an accepted "7" was marked wrong. Now a unit may follow
// the number, and it must be the question's unit (decided 2026-09-29).

test('the reported case: 7 m/s² for an acceleration of 7',()=>{
 for(const typed of ['7','7 m/s²','7m/s^2','7 m/s^2','7 m s^-2','7 m s⁻²','7 ms⁻²','7 ms-2','7 m/s/s','7 metres per second squared'])
  assert.ok(answerMatches(typed,['7'],'m/s²'),typed);
});

test('a wrong unit is wrong',()=>{
 for(const typed of ['7 kg','7 m/s','7 N','7 m','7 s','7 J']) assert.ok(!answerMatches(typed,['7'],'m/s²'),typed);
});

test('another prefix is another unit, even when converted',()=>{
 assert.ok(answerMatches('1.6 m',['1.6'],'m'));assert.ok(answerMatches('1.6 metres',['1.6'],'m'));
 assert.ok(!answerMatches('1.6 cm',['1.6'],'m'));assert.ok(!answerMatches('160 cm',['1.6'],'m'));
 assert.ok(!answerMatches('1.6 km',['1.6'],'m'));assert.ok(!answerMatches('5 g',['5'],'kg'));
 assert.ok(answerMatches('12 cm',['12'],'cm'));assert.ok(!answerMatches('12 m',['12'],'cm'));
});

test('the same unit written another way, or an equivalent SI unit, is right',()=>{
 assert.ok(answerMatches('20 N·s',['20'],'kg·m/s'));assert.ok(answerMatches('20 kg m/s',['20'],'kg·m/s'));assert.ok(answerMatches('20 Ns',['20'],'kg·m/s'));
 assert.ok(answerMatches('6 J',['6'],'N m'));assert.ok(answerMatches('6 Nm',['6'],'N m'));assert.ok(answerMatches('6 N·m',['6'],'N m'));
 for(const typed of ['25 Ω','25 ohm','25 ohms','25 V/A']) assert.ok(answerMatches(typed,['25'],'Ω'),typed);
 assert.ok(answerMatches('3 kg/m^3',['3'],'kg/m³'));assert.ok(answerMatches('3 kg m⁻³',['3'],'kg/m³'));assert.ok(!answerMatches('3 g/cm³',['3'],'kg/m³'));
 assert.ok(answerMatches('9.8 m/s²',['9.8'],'N/kg'));
 assert.ok(answerMatches('56.52 million km/year',['56.52'],'million km/year'));assert.ok(!answerMatches('56.52 km/year',['56.52'],'million km/year'));
});

test('lower case is forgiven when nothing else is meant',()=>{
 assert.ok(answerMatches('7 j',['7'],'J'));assert.ok(answerMatches('50 hz',['50'],'Hz'));assert.ok(answerMatches('2 n',['2'],'N'));
 assert.ok(answerMatches('3 mpa',['3'],'MPa'));assert.ok(answerMatches('4 w/m^2',['4'],'W/m^2'));
 assert.ok(!answerMatches('8 Nm',['8'],'nm'),'N m is not nm');
});

// "mm" once also read as m·m, which would have passed "7 mm" for an area.
test('run-together symbols are not read in silly ways',()=>{
 assert.ok(!answerMatches('7 mm',['7'],'m²'));assert.ok(answerMatches('7 m^2',['7'],'m²'));
 assert.ok(!answerMatches('4.8 stands',['4.8'],'s'));assert.ok(!answerMatches('5 at',['5'],'A'));
});

test('temperature and angle units keep their degree sign',()=>{
 assert.ok(answerMatches('18°',['18'],'°'));assert.ok(answerMatches('18 degrees',['18'],'°'));
 assert.ok(answerMatches('25 °C',['25'],'°C'));assert.ok(answerMatches('25°C',['25'],'°C'));assert.ok(answerMatches('25 degrees Celsius',['25'],'°C'));
 assert.ok(!answerMatches('25 C',['25'],'°C'),'C is the coulomb');assert.ok(!answerMatches('25 K',['25'],'°C'));
 // tidy() drops "°", which once let "1.8°" through as 1.8.
 assert.ok(!answerMatches('1.8°',['1.8'],'m'));assert.ok(!answerMatches('1.8 °',['1.8'],'m'));
});

test('money is written before or after the number',()=>{
 for(const typed of ['R60','R 60','60 R','60 rand']) assert.ok(answerMatches(typed,['60'],'R'),typed);
 assert.ok(!answerMatches('R61',['60'],'R'));assert.ok(!answerMatches('60 J',['60'],'R'));
});

test('an answer with no unit refuses any unit',()=>{
 assert.ok(answerMatches('16',['16'],''));assert.ok(!answerMatches('16 m',['16'],''));assert.ok(!answerMatches('16°',['16'],''));
});

test('nonsense after the number is wrong',()=>{
 for(const unit of ['m/s²','',undefined]) {assert.ok(!answerMatches('7 bananas',['7'],unit));assert.ok(!answerMatches('7x',['7'],unit));}
});

// Sessions saved before units were checked carry no unit.
test('an older session accepts any real unit',()=>{
 assert.ok(answerMatches('7 m/s²',['7']));assert.ok(answerMatches('7 kg',['7']));assert.ok(!answerMatches('7 bananas',['7']));
});

test('the number is still compared to 0.1%, and lists are unchanged',()=>{
 assert.ok(answerMatches('100.09 N',['100'],'N'));assert.ok(!answerMatches('100.11 N',['100'],'N'));
 assert.ok(answerMatches('0 m/s',['0'],'m/s'));assert.ok(!answerMatches('0.00001 m/s',['0'],'m/s'));
 assert.ok(answerMatches('1, 2',['1,2']));assert.ok(!answerMatches('12',['1,2']));
 assert.ok(answerMatches('-4 N m',['-4'],'N m'));assert.ok(!answerMatches('4 N m',['-4'],'N m'));
});

test('generated questions carry the unit of their answer',()=>{
 for(let i=0;i<50;i++) for(const question of makePhysicsQuestions('igcse','igcse-u2','foundational')) {
  if(question.templateId!=='igcse-u2-f6') continue;
  assert.equal(question.unit,'m/s²');
  assert.ok(answerMatches(`${question.answers[0]} m/s^2`,question.answers,question.unit));
  assert.ok(!answerMatches(`${question.answers[0]} kg`,question.answers,question.unit));
 }
 for(const question of makePhysicsQuestions('igcse','igcse-u19','foundational'))
  if(Number.isFinite(Number(question.answers[0]))) assert.equal(question.unit,'');
});

test('the answer box and the marked answer name the unit',()=>{
 const base:PhysicsQuestion={prompt:'Find its acceleration.',answers:['7'],hint:'h',solution:'s'};
 assert.match(answerFormatFor({...base,unit:'m/s²'}),/if you give one it must be the right unit/);
 assert.match(answerFormatFor({...base,unit:''}),/without a unit/);
 assert.match(answerFormatFor(base),/including units where shown/);
 assert.equal(expectedAnswerText({...base,unit:'m/s²'}),'7 m/s²');
 assert.equal(expectedAnswerText({...base,answers:['north']}),'north');
});

test('marking a physics set passes each question its unit',()=>{
 const questions:PhysicsQuestion[]=[
  {templateId:'a',prompt:'Acceleration?',answers:['7'],hint:'h',solution:'s',unit:'m/s²'},
  {templateId:'b',prompt:'Mass?',answers:['3'],hint:'h',solution:'s',unit:'kg'},
  {templateId:'c',prompt:'Old session',answers:['5'],hint:'h',solution:'s'},
 ];
 const {results,score}=markPracticeSet(questions,['7 m/s²','3 m/s²','5 N'],q=>q.answers,(answer,accepted,q)=>answerMatches(answer,accepted,q.unit),expectedAnswerText);
 assert.deepEqual(results.map(r=>r.correct),[true,false,true]);
 assert.deepEqual(results.map(r=>r.expected),['7 m/s²','3 kg','5']);
 assert.equal(score,67);
});
