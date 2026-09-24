import {test} from 'node:test';import assert from 'node:assert/strict';
import {extractPdfPages} from '@/lib/server-pdf';
import {structuredPaper,finalAnswer,schemeMarks,schemeFor,schemeCrop,roundingTolerance} from '@/lib/structured-paper';
import {studentView} from '@/lib/exam-paper-access';
import {checkPartsFound,paperIdentity} from '@/lib/exam-paper-layout';
import {markAnswer,compareNumeric} from '@/lib/physics-marking-engine';
import type {SchemeRow} from '@/lib/cambridge-analysis';
import type {Answer,Paper} from '@/lib/physics-extraction-schema';
import {approvePaper,makeSubmission,checkAnswer,CheckSchema} from '@/lib/physics-exam-workflows';
import {writePdf,A4,type Page} from '../fixtures/synthetic-pdf';
import {asPhysicsStructured} from '../fixtures/synthetic-papers';

// Structured papers read from their PDFs' text, without AI. Checked by hand on
// real 9702 and 0625 papers (not committed); these use synthetic ones.
const pages=(p:Page[])=>extractPdfPages(writePdf(p));
const read=async(paper=asPhysicsStructured.paper,scheme=asPhysicsStructured.scheme)=>structuredPaper(await pages(paper),await pages(scheme));
const typed=(questionId:string,text:string):Answer=>({questionId,mode:'typed',text,steps:{},file:null});

// ── The whole paper ────────────────────────────────────────────────────────
test('every part in the scheme is found, with its marks, and nothing flagged',async()=>{
 const {extraction:x,crops}=await read();
 assert.deepEqual(x.questions.map(q=>[q.id,q.marks]),asPhysicsStructured.expected.map(e=>[e.label,e.marks]));
 assert.deepEqual(x.questions.flatMap(q=>q.issues),[]);
 assert.deepEqual(x.warnings,[]);
 for(const e of asPhysicsStructured.expected){
  const own=crops[e.label].at(-1)!;
  assert.equal(own.page,e.page,e.label);assert.ok(own.height<1,`${e.label} is cropped`);
 }
});
test('a calculation with one final answer is marked automatically; the rest go to the teacher',async()=>{
 const {extraction:x}=await read();
 const kinds=Object.fromEntries(x.schemes.map(s=>[s.questionId,s.kind==='numeric'?s.accepted.join('|'):'teacher']));
 assert.deepEqual(kinds,{'1(a)':'teacher','1(b)':'1.5 m s^-2','2(a)':'teacher','2(b)(i)':'600 J','2(b)(ii)':'120 W','3(a)':'teacher','3(b)':'teacher'});
 assert.match(x.questions.find(q=>q.id==='3(b)')!.text,/Show that/,'"show that" is why 3(b) is not automatic');
});
test('a correct final answer scores full marks, in any reasonable form; a wrong one goes to the teacher',async()=>{
 const {extraction:x}=await read();
 const mark=(id:string,text:string)=>markAnswer(x.questions.find(q=>q.id===id)!,x.schemes.find(s=>s.questionId===id),typed(id,text));
 for(const answer of ['1.5','1.5 m s-2','1.50 m/s^2','1.5 m s⁻²'])assert.equal(mark('1(b)',answer).proposed,2,answer);
 for(const answer of ['600','600 J','6.0 × 10^2 J','0.6 kJ'])assert.equal(mark('2(b)(i)',answer).proposed,2,answer);
 assert.equal(mark('1(b)','2.0').status,'needs_review','a miss on a two-mark part may still earn the method mark');
 assert.equal(mark('1(b)','1.5 N').status,'needs_review','wrong units are not full marks');
 assert.equal(mark('3(b)','8.0').status,'needs_review');
});
test('the marks printed on the paper are checked against the scheme',async()=>{
 const paper=asPhysicsStructured.paper.map(p=>({...p,runs:p.runs.map(r=>r.text==='[2]'&&r.top===240?{...r,text:'[3]'}:r)}));
 const {extraction:x}=await read(paper);
 const q=x.questions.find(q=>q.id==='1(b)')!,s=x.schemes.find(s=>s.questionId==='1(b)')!;
 assert.match(q.issues.join(),/prints \[3\] .* codes add up to 2; \[3\] is used/);
 assert.deepEqual([q.marks,s.marks],[3,3],'the printed mark is the part\'s mark');
 assert.equal(s.kind,'manual','a reading that disagrees with the paper is not marked automatically');
 assert.deepEqual(s.numeric?.accepted,['1.5 m s^-2'],'its answer is kept, for the teacher to switch back on');
});
test('the paper total is checked against the parts read',async()=>{
 const paper=asPhysicsStructured.paper.map(p=>({...p,runs:p.runs.map(r=>r.text.includes('total mark for this paper is 12')?{...r,text:r.text.replace('12','15')}:r)}));
 const {extraction:x}=await read(paper);
 assert.match(x.warnings.join(),/total is 15 marks, but the parts read add up to 12/);
});
test('one combined PDF gives the same paper',async()=>{
 const combined=await pages([...asPhysicsStructured.paper,...asPhysicsStructured.scheme]);
 const {extraction:x}=structuredPaper(combined,combined);
 assert.deepEqual(x.questions.map(q=>[q.id,q.marks,q.issues.length]),asPhysicsStructured.expected.map(e=>[e.label,e.marks,0]));
});
test('a paper read without AI publishes, and a student\'s answers are marked or sent to the teacher',async()=>{
 const {extraction,crops}=await read();
 const draft:Paper={...extraction,id:'p',title:'t',status:'draft',files:[],revision:0,createdAt:'',kind:'structured',reader:'text',crops};
 const paper=approvePaper(draft,extraction);
 assert.deepEqual([paper.status,paper.reader,paper.crops],['ready','text',crops],'publishing keeps how it was read and its screenshots');
 const said:Record<string,string>={'1(b)':'1.5 m/s^2','2(b)(i)':'650 J','2(b)(ii)':'120'};
 const submission=makeSubmission(paper,'S',false,paper.questions.map(q=>typed(q.id,said[q.id]??'a written answer')));
 const grade=(id:string)=>submission.grades.find(g=>g.questionId===id)!;
 assert.deepEqual([grade('1(b)').status,grade('1(b)').proposed],['proposed',2],'right: full marks, for the teacher to confirm');
 assert.deepEqual([grade('2(b)(ii)').status,grade('2(b)(ii)').proposed],['proposed',2]);
 assert.equal(grade('2(b)(i)').status,'needs_review','wrong on a two-mark part: the teacher decides the method mark');
 for(const id of ['1(a)','2(a)','3(a)','3(b)'])assert.equal(grade(id).status,'needs_review',id);
});
test('practising, a student can check an answer: right scores at once, anything else says the teacher marks it',async()=>{
 const {extraction,crops}=await read();
 const paper:Paper={...extraction,id:'p',title:'t',status:'ready',files:[],revision:1,createdAt:'',kind:'structured',reader:'text',crops};
 const check=(questionId:string,text:string)=>checkAnswer(paper,CheckSchema.parse({paperId:'8a6e0804-2bd0-4a2f-8f1f-0c7c1f8b1c11',questionId,text}));
 assert.deepEqual([check('1(b)','1.5 m/s²').status,check('1(b)','1.5 m/s²').proposed],['self_practice',2]);
 assert.deepEqual([check('1(b)','3.0').status,check('1(b)','3.0').expected],['needs_review','1.5 m s⁻²'],'wrong on two marks: the teacher, and the answer shown');
 assert.equal(check('2(a)','work done per second').status,'needs_review');
});
test('students receive none of the mark scheme: no answers, points or scheme screenshots',async()=>{
 const {extraction,crops,schemeCrops}=await read();
 const paper:Paper={...extraction,id:'p',title:'t',status:'ready',files:[{role:'questions',file:{id:'qp',name:'q.pdf',mime:'application/pdf',size:1}},{role:'scheme',file:{id:'ms',name:'m.pdf',mime:'application/pdf',size:1}}],
  revision:1,createdAt:'',kind:'structured',reader:'text',crops,schemeCrops};
 const sent=JSON.stringify(studentView(paper));
 for(const secret of ['1.5 m s','600 J','120 W','a = (v - u) / t','W = Fs','magnitude and direction','schemeCrops','"ms"'])
  assert.ok(!sent.includes(secret),`students must not receive ${secret}`);
 assert.ok(studentView(paper).schemes.every(s=>s.points.length===0));
});
test('each part has its mark-scheme rows, for the teacher',async()=>{
 const {schemeCrops}=await read();
 assert.deepEqual(Object.keys(schemeCrops),asPhysicsStructured.expected.map(e=>e.label));
 assert.deepEqual(schemeCrops['2(b)(i)'].map(c=>[c.page,c.rotate]),[[2,0]]);
 assert.deepEqual(schemeCrops['3(a)'].map(c=>c.page),[3,4],'a row split over a page break has a crop on each page');
});
test('a sideways scheme row is cut as a vertical strip and turned upright',()=>{
 const strip=schemeCrop({page:7,top:0.58,bottom:0.64,rotated:true});
 assert.deepEqual({...strip,width:+strip.width.toFixed(3)},{page:7,x:0.565,y:0.06,width:0.091,height:0.885,rotate:90});
 const upright=schemeCrop({page:2,top:0.2,bottom:0.3,rotated:false});
 assert.equal(upright.rotate,0);assert.ok(upright.y<0.2&&upright.y+upright.height>0.3);
});
test('rounding tolerance reads powers of ten as a teacher types them',()=>{
 assert.deepEqual(['1.8 × 10^-2 J','1.8 x 10^-2 J','3.0×10^8 J'].map(roundingTolerance),[0.0005,0.0005,5e6]);
});
// The June question paper was uploaded with the March mark scheme (2026-09-24).
const withSeries=(set:Page[],series:string)=>set.map((p,i)=>i?p:{...p,runs:[...p.runs,{text:series,x:300,top:170}]});
test('a mark scheme for another series is refused, naming both',async()=>{
 await assert.rejects(read(withSeries(asPhysicsStructured.paper,'May/June 2026'),withSeries(asPhysicsStructured.scheme,'February/March 2026')),
  /mark scheme is for February\/March 2026, but the question paper is May\/June 2026/);
 const same=await read(withSeries(asPhysicsStructured.paper,'May/June 2026'),withSeries(asPhysicsStructured.scheme,'May/June 2026'));
 assert.equal(same.extraction.questions.length,asPhysicsStructured.expected.length);
});
test('a scheme whose parts are mostly not on the question paper is refused; one or two missing are only flagged',()=>{
 assert.throws(()=>checkPartsFound(17,34),/17 of the mark scheme's 34 parts are not on this question paper/);
 assert.doesNotThrow(()=>checkPartsFound(33,35));
 assert.doesNotThrow(()=>checkPartsFound(8,10),'two missing of ten: flagged on the parts, not refused');
});
test('the paper and series are read from the cover',()=>{
 const cover=(words:string[])=>[{pageNumber:1,width:595,height:842,words:words.map((text,i)=>({text,x:50+i*40,top:100}))}];
 assert.deepEqual(paperIdentity(cover(['PHYSICS','9702/22','Paper','2','May/June','2026'])),{code:'9702/22',series:'May/June 2026'});
 assert.deepEqual(paperIdentity(cover(['PHYSICS','Specimen'])),{code:null,series:null});
});
test('a scan is refused with a reason, and so is a scheme with no table',async()=>{
 const blank=await pages([{...A4,runs:[]},{...A4,runs:[]}]);
 assert.throws(()=>structuredPaper(blank,blank),/looks like a scan/);
 const paper=await pages(asPhysicsStructured.paper);
 assert.throws(()=>structuredPaper(paper,paper),/No mark scheme table was found/);
});

// ── Final answers as schemes print them ────────────────────────────────────
// Invented values, in the layouts the real schemes use.
const cases:Array<[string,string[],[number,number]|null]>=[
 ['v = 34 m s –1',['34 m s^-1'],null],
 ['E = 2.6 × 10 –3 J',['2.6*10^-3 J'],null],
 ['7.0 × 10 5 Pa',['7.0*10^5 Pa'],null],
 ['52 000 kg',['52000 kg'],null],
 ['4.0 × 10 6 (J)',['4.0*10^6 J'],null],
 ['( I =) 2.7 × 10 –8 A',['2.7*10^-8 A'],null],
 ['( V 3 = 4 × 3 =) 12 V',['12 V'],null],
 ['2.0 kg m / s OR 2.0 N s',['2.0 kg m / s','2.0 N s'],null],
 ['speed in range 0.20 to 0.35 m / s 2',['0.20 m / s^2'],[0.20,0.35]],
 ['310–360 m / s',['310 m / s'],[310,360]],
 ['angle = 45°',['45 °'],null],
 ['path difference = (50 – 35) / 6 = 1.5 λ',['1.5'],null],
 ['(3 × 10 12 atoms remain after) 620 yrs or 2 half-lives',['620 yrs'],null],
 ['ratio = 0.64 Page 9 of 12',['0.64'],null],
];
for(const [text,accepted,range] of cases)test(`final answer: ${text}`,()=>{
 const found=finalAnswer(text);
 assert.ok(found,text);assert.deepEqual([found.accepted,found.range],[accepted,range]);
});
for(const text of ['e.g. 330 m / s gives 15 000 Hz','1 1 2 charge = − − + = 0 3 3 3','25 °C','line starts at (0, 8.5) and crosses the axis','particles are at rest'])
 test(`not a plain final answer: ${text}`,()=>assert.equal(finalAnswer(text),null));
test('anything that rounds to the published answer is accepted',()=>{
 assert.deepEqual(['0.87 s','16 m s^-1','1.8*10^-2 J','6.0 cm'].map(roundingTolerance),[0.005,0.5,0.0005,0.05]);
});

// ── Marking points ─────────────────────────────────────────────────────────
const row=(label:string,points:Array<[string,string,string?]>):SchemeRow=>({label,answer:'',marks:null,guidance:'',points:points.map(([marks,answer,guidance=''])=>({marks,answer,guidance}))});
test('continuation lines join their point, and a page footer is dropped',()=>{
 const marks=schemeMarks(row('1(a)',[['C1','F = ma'],['','F = 2.0 × 3.0'],['A1','= 6.0 N'],['','Page 4 of 12']]));
 assert.deepEqual(marks.map(m=>[m.code,m.text]),[['C1','F = ma\nF = 2.0 × 3.0'],['A1','= 6.0 N']]);
});
test('an alternative method is shown but its marks are not added',()=>{
 const r=row('8(b)',[['C1','V = IR'],['A1','= 16 V'],['C1','OR alternative route'],['A1','= 16 V']]);
 const {scheme}=schemeFor(r,schemeMarks(r),'Calculate the p.d.');
 assert.equal(scheme.marks,2);assert.equal(scheme.points.length,4);assert.match(scheme.points[2].description,/^\(alternative\)/);
});
test('"Alternative methods:" starts an alternative too, as 9702 schemes put it',()=>{
 const r=row('1(b)(iv)',[['C1','v2 = 2as'],['A1','speed = 8.7 m s –1'],['C1','Alternative methods: t = 34.6'],['A1','speed = 8.7 m s –1'],['C1','OR v = at'],['A1','v = 8.7']]);
 assert.equal(schemeFor(r,schemeMarks(r),'Determine the speed.').scheme.marks,2);
});

// ── When a correct final answer is not the whole story ─────────────────────
const kindOf=(points:Array<[string,string,string?]>,question='Calculate the force.')=>{
 const r=row('1(a)',points);return schemeFor(r,schemeMarks(r),question).scheme.kind;
};
test('automatic only when a correct final answer earns every mark',()=>{
 assert.equal(kindOf([['C1','F = ma'],['A1','= 6.0 N']]),'numeric');
 assert.equal(kindOf([['A1','F MAX = 0.45 N']]),'numeric','"MAX" in an answer is not the guidance "max"');
 assert.equal(kindOf([['M1','F = ma'],['A1','= 6.0 N']]),'manual','an M mark needs the method');
 assert.equal(kindOf([['B1','F = ma'],['A1','= 6.0 N']]),'manual','a B mark is a separate fact');
 assert.equal(kindOf([['A1','= 6.0 N'],['A1','= 3.0 m']]),'manual','two answers');
 assert.equal(kindOf([['C1','F = ma'],['A1','= 6.0 N']],'Show that the force is about 6 N.'),'manual');
 assert.equal(kindOf([['C1','F = ma'],['A1','= 6.0 N']],'Estimate the force.'),'manual');
 assert.equal(kindOf([['C1','F = ma'],['A1','= 6.0 N','ecf from (a)']]),'manual');
 assert.equal(kindOf([['C1','F = ma'],['A1','= 6.0 N','do not accept 6 N']]),'manual');
});
test('on a one-mark part, anything that could make a right answer miss stays with the teacher',()=>{
 assert.equal(kindOf([['A1','= 6.0 N']]),'numeric');
 assert.equal(kindOf([['A1','= 6.0 N','allow 6 N']]),'manual','other forms are allowed');
 assert.equal(kindOf([['A1','= 6.0 N']],'Use your answer in (a) to calculate the force.'),'manual');
 assert.equal(kindOf([['A1','= 6000 N']]),'manual','precision of 6000 is unclear');
 assert.equal(kindOf([['A1','= 620 yrs or 2 half-lives']]),'manual','only some forms can be checked');
 assert.equal(kindOf([['A1','= 6.0 N']],'Give your answer in terms of λ.'),'numeric','"your answer in terms of" is not an earlier answer');
 assert.equal(kindOf([['C1','F = ma'],['A1','= 6.0 N','allow 6 N']]),'numeric','on two marks a miss still reaches the teacher');
});

// ── Units the schemes use ──────────────────────────────────────────────────
const rule=(accepted:string)=>({accepted:[accepted],unitRequired:false,relativeTolerance:0,absoluteTolerance:0.5,range:null});
test('angles in degrees, with or without the sign, or in radians',()=>{
 for(const answer of ['45','45°','45 °','0.785398 rad'])assert.equal(compareNumeric(answer,rule('45 °')).result,'match',answer);
 assert.equal(compareNumeric('45 m',rule('45 °')).result,'miss');
});
test('years, for half-lives',()=>{
 for(const answer of ['620','620 years','620 yr'])assert.equal(compareNumeric(answer,rule('620 yrs')).result,'match',answer);
});
