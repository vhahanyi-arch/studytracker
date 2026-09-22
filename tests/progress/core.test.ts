import {test} from 'node:test';import assert from 'node:assert/strict';
import {hintRate,inTimeOrder,overall,trend,perUnit,series,MIN_SETS_FOR_TREND,type PracticeSession} from '@/lib/progress';

// day 1 is the oldest. Defaults describe an ordinary maths set so each test
// only states the fields it actually cares about.
const s=(day:number,over:Partial<PracticeSession>={}):PracticeSession=>({
 source:'maths',track:'8',chapterId:'s8-u1',score:70,hints:0,questions:10,
 completedAt:`2026-01-${String(day).padStart(2,'0')}T09:00:00Z`,...over,
});

test('a hint count becomes a rate per question',()=>{
 assert.equal(hintRate(s(1,{hints:3,questions:6})),0.5);
});

// Sets differ in length by unit and difficulty, so the raw counts would rank
// a long easy set above a short hard one.
test('the same hint count on a longer set is a lower rate',()=>{
 assert.ok(hintRate(s(1,{hints:4,questions:20}))! < hintRate(s(1,{hints:4,questions:8}))!);
});

test('a set with no questions recorded has no rate',()=>{
 assert.equal(hintRate(s(1,{questions:0})),null);
});

test('sessions sort oldest first whatever order they arrive in',()=>{
 const ordered=inTimeOrder([s(3),s(1),s(2)]);
 assert.deepEqual(ordered.map(x=>x.completedAt.slice(8,10)),['01','02','03']);
});

test('inTimeOrder does not mutate its input',()=>{
 const given=[s(3),s(1)];inTimeOrder(given);
 assert.equal(given[0].completedAt.slice(8,10),'03');
});

test('overall counts sets, averages and strong sets',()=>{
 const o=overall([s(1,{score:60}),s(2,{score:80}),s(3,{score:100})]);
 assert.equal(o.sets,3);assert.equal(o.averageScore,80);assert.equal(o.strongSets,2);
});

test('overall reports the most recent activity',()=>{
 assert.equal(overall([s(2),s(5),s(1)]).lastActive,'2026-01-05T09:00:00Z');
});

// A zero-question set must not drag the hint average toward zero.
test('a set with no questions is left out of the hint average',()=>{
 const o=overall([s(1,{hints:2,questions:10}),s(2,{hints:0,questions:0})]);
 assert.equal(o.averageHintRate,0.2);
});

test('overall of nothing reports no averages rather than zero',()=>{
 const o=overall([]);
 assert.equal(o.sets,0);assert.equal(o.averageScore,null);assert.equal(o.averageHintRate,null);
});

test('no trend is claimed below the minimum',()=>{
 const t=trend([s(1),s(2),s(3)]);
 assert.equal(t.enough,false);assert.equal(t.enough===false&&t.needed,MIN_SETS_FOR_TREND);
});

test('a trend appears exactly at the minimum',()=>{
 assert.equal(trend([s(1),s(2),s(3),s(4)]).enough,true);
});

// The claim in the comment on trend(): the two ends never share a set, so a
// single good result cannot appear on both sides of the comparison.
test('the compared windows never overlap',()=>{
 for(let n=MIN_SETS_FOR_TREND;n<=12;n++){
  const t=trend(Array.from({length:n},(_,i)=>s(i+1)));
  assert.equal(t.enough,true);
  if(t.enough) assert.ok(t.window*2<=n,`window ${t.window} overlaps at ${n} sets`);
 }
});

test('the window is capped at three however many sets there are',()=>{
 const t=trend(Array.from({length:40},(_,i)=>s(i+1)));
 assert.equal(t.enough&&t.window,3);
});

test('improvement is measured from the earliest sets to the latest',()=>{
 const t=trend([s(1,{score:40}),s(2,{score:40}),s(3,{score:90}),s(4,{score:90})]);
 assert.equal(t.enough&&t.scoreFrom,40);assert.equal(t.enough&&t.scoreTo,90);
});

test('falling hint reliance is visible even when the score holds steady',()=>{
 const t=trend([s(1,{hints:5,questions:10}),s(2,{hints:5,questions:10}),
                s(3,{hints:1,questions:10}),s(4,{hints:1,questions:10})]);
 assert.equal(t.enough&&t.hintRateFrom,0.5);assert.equal(t.enough&&t.hintRateTo,0.1);
});

// At seven sets the windows are three a side, so the fourth belongs to
// neither. At six they would meet exactly and nothing would be dropped.
test('sets between the two windows are ignored rather than averaged in',()=>{
 const t=trend([s(1,{score:10}),s(2,{score:10}),s(3,{score:10}),s(4,{score:100}),
                s(5,{score:20}),s(6,{score:20}),s(7,{score:20})]);
 assert.equal(t.enough&&t.scoreFrom,10);assert.equal(t.enough&&t.scoreTo,20);
});

test('at six sets the two windows meet and no set is dropped',()=>{
 const t=trend([s(1,{score:0}),s(2,{score:0}),s(3,{score:0}),s(4,{score:60}),s(5,{score:60}),s(6,{score:60})]);
 assert.equal(t.enough&&t.scoreFrom,0);assert.equal(t.enough&&t.scoreTo,60);
});

// Chapter ids repeat across stages and across the two subjects, so grouping on
// the id alone would merge a Stage 9 unit into its Stage 8 namesake.
test('the same chapter id in two stages stays two units',()=>{
 const units=perUnit([s(1,{track:'8',chapterId:'u1'}),s(2,{track:'9',chapterId:'u1'})]);
 assert.equal(units.length,2);
});

test('the same chapter id in two subjects stays two units',()=>{
 const units=perUnit([s(1,{source:'maths',chapterId:'waves'}),s(2,{source:'physics',track:'igcse',chapterId:'waves'})]);
 assert.equal(units.length,2);
});

// The maths and physics track names do not collide today ("8" against
// "igcse"), so the test above would still pass if the key dropped the subject
// entirely. The key should not rest on that coincidence: a physics track ever
// named for a number must not merge into the Lower Secondary stage of the
// same name.
test('the subject separates units even when the track names match',()=>{
 const units=perUnit([s(1,{source:'maths',track:'9',chapterId:'u1'}),s(2,{source:'physics',track:'9',chapterId:'u1'})]);
 assert.equal(units.length,2);
});

test('a unit reports its first, latest and best score',()=>{
 const [u]=perUnit([s(1,{score:30}),s(2,{score:95}),s(3,{score:60})]);
 assert.equal(u.firstScore,30);assert.equal(u.latestScore,60);assert.equal(u.bestScore,95);
});

test('first and latest follow time, not the order rows arrive',()=>{
 const [u]=perUnit([s(3,{score:60}),s(1,{score:30}),s(2,{score:95})]);
 assert.equal(u.firstScore,30);assert.equal(u.latestScore,60);
});

test('mastery needs two strong sets, not one',()=>{
 assert.equal(perUnit([s(1,{score:95}),s(2,{score:50})])[0].mastered,false);
 assert.equal(perUnit([s(1,{score:95}),s(2,{score:80})])[0].mastered,true);
});

test('a score exactly on the threshold counts as strong',()=>{
 assert.equal(perUnit([s(1,{score:80}),s(2,{score:80})])[0].mastered,true);
});

test('units are listed most recently practised first',()=>{
 const units=perUnit([s(1,{chapterId:'old'}),s(9,{chapterId:'new'})]);
 assert.deepEqual(units.map(u=>u.chapterId),['new','old']);
});

test('the series is oldest first and indexed from zero',()=>{
 const points=series([s(3),s(1),s(2)]);
 assert.deepEqual(points.map(p=>p.index),[0,1,2]);
 assert.equal(points[0].completedAt.slice(8,10),'01');
});

test('the series keeps the most recent sets when trimming',()=>{
 const points=series(Array.from({length:20},(_,i)=>s(i+1,{score:i})),5);
 assert.equal(points.length,5);
 assert.deepEqual(points.map(p=>p.score),[15,16,17,18,19]);
});

test('an empty history produces an empty series rather than throwing',()=>{
 assert.deepEqual(series([]),[]);
});
