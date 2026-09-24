import {test} from 'node:test';import assert from 'node:assert/strict';
import {extractPdfPages} from '@/lib/server-pdf';
import {multipleChoicePaper,questionCrops} from '@/lib/exam-paper-layout';
import {markAnswer} from '@/lib/physics-marking-engine';
import {studentView,studentMayOpen,filesOfPaper} from '@/lib/exam-paper-access';
import type {Paper,Scheme,Question,Answer} from '@/lib/physics-extraction-schema';
import {writePdf,A4,type Page} from '../fixtures/synthetic-pdf';
import {physicsMultipleChoice,asPhysicsStructured,rotatedScheme} from '../fixtures/synthetic-papers';

const pages=(p:Page[])=>extractPdfPages(writePdf(p));

// ── Multiple choice without a model ────────────────────────────────────────
test('a multiple-choice paper is read with its answer key and no issues',async()=>{
 const {extraction,crops}=multipleChoicePaper(await pages(physicsMultipleChoice.paper),await pages(physicsMultipleChoice.scheme));
 assert.deepEqual(extraction.questions.map(q=>[q.id,q.marks,q.issues.length]),physicsMultipleChoice.expected.map(e=>[e.label,1,0]));
 assert.deepEqual(extraction.schemes.map(s=>[s.kind,s.accepted]),physicsMultipleChoice.expected.map(e=>['exact',[e.answer]]));
 assert.deepEqual(Object.values(crops).map(c=>c[0].page),physicsMultipleChoice.expected.map(e=>e.page));
});
test('one combined PDF gives the same paper',async()=>{
 const combined=await pages([...physicsMultipleChoice.paper,...physicsMultipleChoice.scheme]);
 const {extraction}=multipleChoicePaper(combined,combined);
 assert.deepEqual(extraction.schemes.map(s=>s.expected),physicsMultipleChoice.expected.map(e=>e.answer));
});
test('a scheme stored as rotated text is read too',async()=>{
 const {extraction}=multipleChoicePaper(await pages(rotatedScheme.paper),await pages(rotatedScheme.scheme));
 assert.deepEqual(extraction.schemes.map(s=>s.expected),rotatedScheme.expected.map(e=>e.answer));
});
test('the syllabus is taken from the paper code',async()=>{
 const withCode=physicsMultipleChoice.paper.map((p,i)=>i?p:{...p,runs:p.runs.map(r=>r.text==='0999/11'?{...r,text:'0625/12'}:r)});
 assert.equal(multipleChoicePaper(await pages(withCode),await pages(physicsMultipleChoice.scheme)).extraction.syllabus,'0625');
 assert.equal(multipleChoicePaper(await pages(physicsMultipleChoice.paper),await pages(physicsMultipleChoice.scheme)).extraction.syllabus,'unknown');
});
test('a question missing from the paper is flagged and shown as the page before',async()=>{
 // Remove question 7's number so it cannot be located.
 const paper=physicsMultipleChoice.paper.map(p=>({...p,runs:p.runs.filter(r=>!(r.text==='7'&&r.x===49.6))}));
 const {extraction,crops}=multipleChoicePaper(await pages(paper),await pages(physicsMultipleChoice.scheme));
 assert.match(extraction.questions.find(q=>q.id==='7')!.issues.join(),/not found on the question paper/);
 assert.deepEqual(crops['7'],[{page:3,x:0,y:0,width:1,height:1}]);
});
test('a scheme with no answer table is refused with a reason',async()=>{
 const paper=await pages(physicsMultipleChoice.paper);
 assert.throws(()=>multipleChoicePaper(paper,paper),/No answer table was found/);
});

// ── Screenshots for extracted questions ────────────────────────────────────
test('extracted questions are located on the paper by their labels',async()=>{
 const paper=await pages(asPhysicsStructured.paper);
 const crops=questionCrops(paper,asPhysicsStructured.expected.map(e=>({id:e.label,marks:e.marks,sourcePages:[e.page]})));
 for(const e of asPhysicsStructured.expected){
  const own=crops[e.label].at(-1)!;
  assert.equal(own.page,e.page,e.label);
  assert.ok(own.height<1,`${e.label} is a crop, not a whole page`);
 }
 assert.ok(crops['2(b)(i)'][0].y<crops['2(b)(ii)'].at(-1)!.y);
});
test('a question running onto the next page gets that page too',async()=>{
 const crops=questionCrops(await pages(asPhysicsStructured.paper),[{id:'2(b)(ii)',marks:2,sourcePages:[2,3]},{id:'3(a)',marks:2,sourcePages:[3]}]);
 assert.deepEqual(crops['2(b)(ii)'].at(-1),{page:3,x:0,y:0,width:1,height:1});
});
// A subpart relies on its part's opening: the set-up and usually the diagram.
const top=(y:number)=>y/A4.height;
test('a later subpart shows the opening of its part above it; the first already includes it',async()=>{
 const paper=await pages(asPhysicsStructured.paper);
 const crops=questionCrops(paper,asPhysicsStructured.expected.map(e=>({id:e.label,marks:e.marks,sourcePages:[e.page]})));
 assert.equal(crops['2(b)(i)'].length,1,'(i) starts at (b), so it has the opening already');
 assert.ok(crops['2(b)(i)'][0].y<top(390));
 const [opening,own]=crops['2(b)(ii)'];
 assert.equal(opening.page,2);
 assert.ok(opening.y<top(390)&&opening.y>top(345),'from the (b) line');
 assert.ok(opening.y+opening.height<top(430)&&opening.y+opening.height>top(400),'down to the (i) line');
 assert.ok(own.y>top(500)&&own.y<top(540),'then the subpart itself');
 for(const label of ['1(a)','1(b)','2(a)','3(a)','3(b)'])assert.equal(crops[label].length,1,`${label} has no subparts`);
});
test('an opening at the foot of the page before (i) is shown from that page',async()=>{
 const run=(top:number,x:number,text:string,bold=false)=>({text,x,top,bold});
 const paper=await pages([
  {...A4,runs:[run(72.6,49.6,'1',true),run(72.6,72.3,'(a)',true),run(72.6,95,'Define momentum.'),run(120,300,'..............................'),run(120,532.3,'[1]'),
   run(640,72.3,'(b)',true),run(640,95,'A ball of mass 0.20 kg is dropped from rest, as shown in Fig. 1.1.'),run(720,250,'Fig. 1.1')]},
  {...A4,runs:[run(72.6,96,'(i)',true),run(72.6,118,'Calculate its speed after 0.50 s.'),run(150,532.3,'[2]'),
   run(260,92.9,'(ii)',true),run(260,118,'State the energy change as it falls.'),run(320,532.3,'[1]')]},
 ]);
 const crops=questionCrops(paper,[{id:'1(a)',marks:1,sourcePages:[1]},{id:'1(b)(i)',marks:2,sourcePages:[1,2]},{id:'1(b)(ii)',marks:1,sourcePages:[1,2]}]);
 for(const label of ['1(b)(i)','1(b)(ii)']){
  const [opening,own]=crops[label];
  assert.equal(crops[label].length,2,label);
  assert.deepEqual([opening.page,own.page],[1,2],label);
  assert.ok(opening.y<top(640)&&opening.y>top(600),`${label}: from the (b) line`);
  assert.ok(opening.y+opening.height<=0.95,`${label}: above the page footer`);
 }
});
test('a question that cannot be located falls back to its whole pages',async()=>{
 const crops=questionCrops(await pages(asPhysicsStructured.paper),[{id:'9(z)',marks:1,sourcePages:[2,3]}]);
 assert.deepEqual(crops['9(z)'].map(c=>[c.page,c.height]),[[2,1],[3,1]]);
});

// ── Marking multiple choice ────────────────────────────────────────────────
const q:Question={id:'5',text:'Question 5 (multiple choice)',context:'',marks:1,topic:'',sourcePages:[1],references:[],issues:[]};
const key=(accepted:string[]):Scheme=>({questionId:'5',raw:'',expected:accepted[0]??'',marks:1,kind:'exact',numeric:null,accepted,points:[],notes:[],unresolvedRules:[],finalAnswerAwardsAll:false,sourcePages:[1]});
const typed=(text:string):Answer=>({questionId:'5',mode:'typed',text,steps:{},file:null});
test('the right letter scores, a wrong or missing one scores nothing, and none waits for a teacher',()=>{
 assert.deepEqual([markAnswer(q,key(['B']),typed('b'),true).final,markAnswer(q,key(['B']),typed('C'),true).final,markAnswer(q,key(['B']),typed(''),true).final],[1,0,0]);
 assert.equal(markAnswer(q,key(['B']),typed('C')).status,'proposed');
});
test('a short answer that is not a letter still goes to the teacher',()=>{
 assert.equal(markAnswer(q,key(['newton']),typed('joule')).status,'needs_review');
});

// ── What students receive ──────────────────────────────────────────────────
const paper=():Paper=>({id:'p',title:'t',syllabus:'0625',status:'ready',revision:1,createdAt:'',warnings:['w'],
 questions:[q],schemes:[{...key(['B']),raw:'B',notes:['n'],points:[{id:'s1',description:'d',marks:1,kind:'exact',accepted:['B'],numeric:null,dependsOn:[]}]}],
 files:[{role:'questions',file:{id:'qp',name:'q.pdf',mime:'application/pdf',size:1}},{role:'scheme',file:{id:'ms',name:'m.pdf',mime:'application/pdf',size:1}}]});
test('students receive no answers before they submit',()=>{
 const view=studentView(paper());
 const text=JSON.stringify(view);
 assert.ok(!/"expected"|"accepted"|"raw"|"notes"|"warnings"/.test(text),text);
 assert.deepEqual(view.files.map(f=>f.role),['questions']);
 // Points label the step fields of a stepped part; on any other part they are
 // lines of the mark scheme, so they stay on the server.
 assert.deepEqual(view.schemes[0].points,[]);
 const stepped=studentView({...paper(),schemes:[{...paper().schemes[0],kind:'stepped'}]});
 assert.deepEqual(stepped.schemes[0].points,[{id:'s1',description:'d',marks:1,kind:'exact'}]);
});
test('deleting a paper removes its PDFs and every file its students sent, once each',()=>{
 const file=(id:string)=>({id,name:id,mime:'image/png',size:1});
 const answer=(questionId:string,f:string|null):Answer=>({questionId,mode:f?'handwritten':'typed',text:'',steps:{},file:f?file(f):null});
 const submissions=[
  {id:'s1',paperId:'p',paperRevision:1,name:'A',selfPractice:false,createdAt:'',grades:[],answers:[answer('5','photo-1'),answer('6',null)]},
  {id:'s2',paperId:'p',paperRevision:1,name:'B',selfPractice:false,createdAt:'',grades:[],answers:[answer('5','photo-1')],wholePaperFiles:[file('page-1'),file('page-2')]},
 ];
 assert.deepEqual(filesOfPaper(paper(),submissions),['qp','ms','photo-1','page-1','page-2']);
 assert.deepEqual(filesOfPaper(paper(),[]),['qp','ms']);
});
test('students may open a published question paper, never its scheme or a draft',()=>{
 assert.equal(studentMayOpen(paper(),'qp'),true);
 assert.equal(studentMayOpen(paper(),'ms'),false);
 assert.equal(studentMayOpen({...paper(),status:'draft'},'qp'),false);
 assert.equal(studentMayOpen(paper(),'unknown'),false);
});
