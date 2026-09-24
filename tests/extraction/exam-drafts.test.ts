import {test} from 'node:test';import assert from 'node:assert/strict';
import {ExamDraftSchema,newerDraft,fitDraft,examDraftKey,type ExamDraft} from '@/lib/exam-drafts';
import {checkAnswer,CheckSchema} from '@/lib/physics-exam-workflows';
import type {Paper} from '@/lib/physics-extraction-schema';

const draft=(over:Partial<ExamDraft>={}):ExamDraft=>ExamDraftSchema.parse({savedAt:'2026-09-24T10:00:00Z',revision:1,index:0,answers:{},...over});
const typed=(text:string)=>({mode:'typed' as const,text,steps:{},file:null});

// ── Which copy wins ────────────────────────────────────────────────────────
test('the newer of the device and server copies is used',()=>{
 const device=draft({savedAt:'2026-09-24T10:05:00Z'}),server=draft({savedAt:'2026-09-24T10:01:00Z'});
 assert.equal(newerDraft(device,server),device);
 assert.equal(newerDraft(server,device),device);
});
test('either copy alone is used, and none means a fresh start',()=>{
 const only=draft();
 assert.equal(newerDraft(only,null),only);assert.equal(newerDraft(null,only),only);assert.equal(newerDraft(null,null),null);
});

// ── A republished paper ────────────────────────────────────────────────────
test('answers, flags and checks for removed questions are dropped',()=>{
 const d=draft({index:5,answers:{'1':typed('a'),'2':typed('b'),'9':typed('gone')},flags:['2','9'],
  checks:{'9':{proposed:1,status:'self_practice',reason:'',expected:'x',marks:1}}});
 const fitted=fitDraft(d,['1','2','3']);
 assert.deepEqual(Object.keys(fitted.answers),['1','2']);
 assert.deepEqual(fitted.flags,['2']);
 assert.deepEqual(fitted.checks,{});
 assert.equal(fitted.index,2,'the position stays on the paper');
});

// ── What the server accepts ────────────────────────────────────────────────
test('a draft from an older version of the page still loads',()=>{
 const parsed=ExamDraftSchema.parse({savedAt:'x',revision:0,index:0,answers:{}});
 assert.deepEqual([parsed.flags,parsed.wholePaperFiles,parsed.checks],[[],[],{}]);
});
test('oversized or malformed drafts are refused',()=>{
 assert.equal(ExamDraftSchema.safeParse({...draft(),answers:{'1':typed('x'.repeat(20001))}}).success,false);
 assert.equal(ExamDraftSchema.safeParse({...draft(),index:-1}).success,false);
 assert.equal(ExamDraftSchema.safeParse({...draft(),answers:{'1':{mode:'spoken',text:'',steps:{},file:null}}}).success,false);
});
test('drafts are kept per student, so a shared computer keeps them apart',()=>{
 assert.notEqual(examDraftKey('user_a','p1'),examDraftKey('user_b','p1'));
});

// ── Checking one answer while practising ───────────────────────────────────
const paper=():Paper=>({id:'p',title:'t',syllabus:'0625',status:'ready',revision:1,createdAt:'',warnings:[],files:[],
 questions:[{id:'1',text:'Question 1 (multiple choice)',context:'',marks:1,topic:'',sourcePages:[2],references:[],issues:[]}],
 schemes:[{questionId:'1',raw:'C',expected:'C',marks:1,kind:'exact',numeric:null,accepted:['C'],points:[],notes:[],unresolvedRules:[],finalAnswerAwardsAll:false,sourcePages:[1]}]});
const input=(text:string)=>CheckSchema.parse({paperId:'8a6e0804-2bd0-4a2f-8f1f-0c7c1f8b1c11',questionId:'1',text});
test('a checked answer is marked straight away, with the expected answer',()=>{
 assert.deepEqual(checkAnswer(paper(),input('c')),{questionId:'1',marks:1,proposed:1,status:'self_practice',reason:'Matches an explicit accepted alternative.',expected:'C',points:[{id:'answer',description:'C',marks:1,hit:true}]});
 assert.equal(checkAnswer(paper(),input('A')).proposed,0);
});
test('checking a question that is not on the paper is refused',()=>{
 assert.throws(()=>checkAnswer(paper(),{...input('A'),questionId:'7'}),/Question not found/);
});
