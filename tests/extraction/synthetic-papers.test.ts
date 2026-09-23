import {test} from 'node:test';import assert from 'node:assert/strict';
import {extractPdfPages} from '@/lib/server-pdf';
import {parseMarkScheme,analysePaperWithMarkScheme} from '@/lib/cambridge-analysis';
import {writePdf} from '../fixtures/synthetic-pdf';
import {syntheticSets,asPhysicsStructured,rotatedScheme} from '../fixtures/synthetic-papers';

// Real Cambridge papers cannot be committed, so scripts/test-cambridge-analysis.mjs
// skips in CI. These made-up papers share the real layout and run everywhere,
// through the same PDF reader the upload routes use on Vercel.

const read=async(set:typeof syntheticSets[number])=>{
 const [paper,scheme]=await Promise.all([extractPdfPages(writePdf(set.paper)),extractPdfPages(writePdf(set.scheme))]);
 const rows=parseMarkScheme(scheme,set.subject,set.mode);
 return {paper,scheme,rows,result:analysePaperWithMarkScheme(paper,rows,set.subject,set.mode)};
};

for(const set of syntheticSets){
 test(`${set.name}: the scheme is read row by row`,async()=>{
  const {rows}=await read(set);
  assert.deepEqual(rows.map(r=>({label:r.label,marks:r.marks,answer:r.answer})),set.expected.map(({label,marks,answer})=>({label,marks,answer})));
 });
 test(`${set.name}: every question is found on its page`,async()=>{
  const {result}=await read(set);
  assert.deepEqual(result.missingLabels,[]);
  assert.deepEqual(result.questions.map(q=>[q.label,q.page_number]),set.expected.map(e=>[e.label,e.page]));
 });
 // Questions on one page are cropped in reading order and do not overlap.
 test(`${set.name}: crops follow reading order`,async()=>{
  const {result}=await read(set);
  for(const [i,q] of result.questions.entries()){
   const next=result.questions[i+1];
   if(next?.page_number===q.page_number)assert.ok(q.crop_y<next.crop_y,`${q.label} starts below ${next.label}`);
  }
 });
}

test('the cover page and the sample row in the marking guidance are not questions',async()=>{
 const {rows,result}=await read(syntheticSets[0]);
 assert.equal(rows.filter(r=>r.label==='5').length,0);
 assert.ok(result.questions.every(q=>q.page_number>1));
});
test('multiple-choice questions are answered by letter',async()=>{
 const {result}=await read(syntheticSets[1]);
 assert.ok(result.questions.every(q=>q.response_type==='multiple_choice'&&/^[A-D]$/.test(q.expected_answer??'')));
});
test('a sketch is held for the teacher and a calculation gets a formula layout',async()=>{
 const {result}=await read(asPhysicsStructured);
 const by=(label:string)=>result.questions.find(q=>q.label===label)!;
 assert.equal(by('3(a)').response_type,'drawing');
 assert.equal(by('3(a)').expected_answer,'Diagram response - teacher review required');
 assert.equal(by('1(b)').response_layout,'formula');
 assert.equal(by('3(b)').response_layout,'formula');
});
test('coded marks add up and keep every marking point',async()=>{
 const {rows}=await read(asPhysicsStructured);
 const row=rows.find(r=>r.label==='2(b)(i)')!;
 assert.deepEqual(row.points.map(p=>p.marks),['C1','A1']);
 assert.match(row.guidance,/300 x 2\.0 \| C1\n= 600 J \| A1/);
});
test('a question continued on the next page is one question with both marking points',async()=>{
 const {rows}=await read(asPhysicsStructured);
 assert.deepEqual(rows.find(r=>r.label==='3(a)')!.points.map(p=>p.answer),['curve through the origin','gradient decreasing as V increases']);
});
// The partial-marks column is what the teacher sees as marking guidance.
test('maths partial marks stay out of the marks and answer columns',async()=>{
 const {rows}=await read(syntheticSets[0]);
 assert.deepEqual(rows.find(r=>r.label==='2(a)')!.points,[{answer:'5',marks:'2',guidance:'M1 for 5x = 25 or better'}]);
 assert.deepEqual(rows.find(r=>r.label==='2(b)')!.points.map(p=>p.guidance),['B1 for 3x + 12 or -2x + 2','or for x + k']);
});
test('a scheme stored as rotated text is read as a landscape page',async()=>{
 const {scheme}=await read(rotatedScheme);
 assert.ok(scheme[1].width>scheme[1].height);
 assert.ok(scheme[1].words.every(w=>w.horizontal));
});
