import {test} from 'node:test';import assert from 'node:assert/strict';
import {cleanQuestion,planQuestionSave,LOCKED_QUESTIONS_ERROR} from '@/lib/question-save';
import {questionPages,wholePaperLink,storedHandwrittenFiles} from '@/lib/handwritten-pages';
import {questionKey} from '@/lib/paper-questions';
import {displayName,studentNames,accountsById,type NamedUser} from '@/lib/students';
import {nextDifficulty,isMastered,markPracticeSet,hintsUsed,isSessionId} from '@/lib/practice-sessions';

// ── question setup: rows keep their ids, and are locked once answered ──────
const saved=[{id:'q1',position:1,label:'1'},{id:'q2',position:2,label:'2(a)'},{id:'q3',position:3,label:'2(b)'}];
const incoming=(labels:string[])=>labels.map((label,i)=>cleanQuestion({label,marks:1,page_number:1},i));
let n=0;const newId=()=>'new'+(++n);
test('saving keeps each row id by position, adds new ids and lists the removed',()=>{
 n=0;
 const grown=planQuestionSave(saved,incoming(['1','2(a)','2(b)','3']),false,newId);
 assert.ok(grown.ok);assert.deepEqual(grown.ok&&grown.rows.map(r=>r.id),['q1','q2','q3','new1']);assert.deepEqual(grown.ok&&grown.removed,[]);
 const shrunk=planQuestionSave(saved,incoming(['1']),false,newId);
 assert.deepEqual(shrunk.ok&&shrunk.rows.map(r=>r.id),['q1']);assert.deepEqual(shrunk.ok&&shrunk.removed,['q2','q3']);
});
test('rows are matched in position order, whatever order the database returned',()=>{
 const plan=planQuestionSave([saved[2],saved[0],saved[1]],incoming(['1','2(a)','2(b)']),true);
 assert.deepEqual(plan.ok&&plan.rows.map(r=>r.id),['q1','q2','q3']);
});
test('once submitted, only the same questions under the same labels may be saved',()=>{
 for(const labels of [['1','2(a)'],['1','2(a)','2(b)','3'],['1','2(a)','3'],['2(a)','1','2(b)']]){
  const plan=planQuestionSave(saved,incoming(labels),true);
  assert.deepEqual(plan,{ok:false,status:409,error:LOCKED_QUESTIONS_ERROR},labels.join());
 }
 assert.equal(planQuestionSave(saved,incoming(['1','2 (A)','2(b)']),true).ok,true,'case and spacing are the same label');
});
test('cleaning narrows every field of an unvalidated question',()=>{
 const q=cleanQuestion({label:'  4(c) ',marks:500,page_number:-2,crop_x:3,crop_width:0,response_type:'essay',answer_slots:9,draft_confidence:'high',expected_answer:'  7 '},0);
 assert.deepEqual([q.label,q.marks,q.page,q.x,q.width,q.responseType,q.answerSlots,q.draftConfidence,q.expectedAnswer,q.topic],['4(c)',100,1,1,1,'typed',6,'high','7','General skills']);
 assert.equal(cleanQuestion({},4).label,'5');
});

// ── labels and handwritten pages ───────────────────────────────────────────
test('a question key ignores case, spaces and a decimal comma',()=>{
 assert.equal(questionKey(' 2 (B) '),'2(b)');assert.equal(questionKey('1,5'),'1.5');assert.equal(questionKey(undefined),'');
});
test('a whole-paper upload maps each question to its file and page',()=>{
 const pages=questionPages([{page_number:3},{page_number:1},{page_number:3},{}]);
 assert.deepEqual(pages,[1,3]);
 // One PDF: its own page of that PDF.
 assert.deepEqual(wholePaperLink(3,pages,1,true),{handwrittenFileIndex:0,handwrittenPdfPage:3,handwrittenPageAssigned:true,handwrittenUploadMode:'whole_paper'});
 // One photo per question page: the photo in that position.
 assert.equal(wholePaperLink(3,pages,2,false).handwrittenFileIndex,1);
 // Otherwise: numbered like the paper page, or the last file.
 assert.equal(wholePaperLink(3,pages,5,false).handwrittenFileIndex,2);
 assert.equal(wholePaperLink(3,pages,1,false).handwrittenFileIndex,0);
 assert.equal(wholePaperLink(3,pages,1,false).handwrittenPdfPage,undefined);
});
test('stored handwriting reads as a list of files, whatever its age',()=>{
 assert.deepEqual(storedHandwrittenFiles(null),[]);
 assert.deepEqual(storedHandwrittenFiles('[{"type":"image/png"},{}]'),[{type:'image/png'},{}]);
 assert.deepEqual(storedHandwrittenFiles('https://x.blob.vercel-storage.com/old.pdf'),[{}]);
 assert.deepEqual(storedHandwrittenFiles('{"url":"x"}'),[{}]);
});

// ── student names ──────────────────────────────────────────────────────────
test('a display name is first and last name, else the username, else "Student"',()=>{
 assert.equal(displayName({id:'a',firstName:'Sam',lastName:'Lee'}),'Sam Lee');
 assert.equal(displayName({id:'a',firstName:'Sam',lastName:null,username:'sam'}),'Sam');
 assert.equal(displayName({id:'a',username:'sam'}),'sam');
 assert.equal(displayName({id:'a'}),'Student');
});
test('names are fetched in batches, and a deleted account is called "Student"',async()=>{
 const people:NamedUser[]=Array.from({length:250},(_,i)=>({id:'u'+i,firstName:'N'+i}));
 const calls:number[]=[];
 const lister={async getUserList({userId,limit}:{userId:string[];limit:number}){calls.push(userId.length);assert.ok(limit>=userId.length);return {data:people.filter(p=>userId.includes(p.id))};}};
 const nameOf=await studentNames(lister,[...people.map(p=>p.id),'gone','u1','',null]);
 assert.deepEqual(calls,[100,100,51]);
 assert.equal(nameOf('u249'),'N249');assert.equal(nameOf('gone'),'Student');
 assert.equal((await accountsById(lister,[])).size,0);assert.equal(calls.length,3,'no ids, no call');
});

// ── generated practice ─────────────────────────────────────────────────────
test('difficulty rises with strong sets, and two strong sets master a unit',()=>{
 assert.deepEqual([0,1,2,5].map(nextDifficulty),['foundational','application','reasoning','reasoning']);
 assert.deepEqual([0,1,2,'3',null].map(isMastered),[false,false,true,true,false]);
});
test('a practice set is marked question by question and scored as a percentage',()=>{
 const questions=[{templateId:'a',objective:'o',prompt:'1+1',solution:'2'},{templateId:'b',objective:'o',prompt:'2+2'},{templateId:'c',objective:'o',prompt:'3+3'}];
 const accepted:Record<string,string[]>={a:['2'],b:['4','four'],c:['6']};
 const {answers,results,score}=markPracticeSet(questions,[' 2 ',4],q=>accepted[q.templateId!],(answer,ok)=>ok.includes(String(answer??'').trim()));
 assert.deepEqual(answers,[' 2 ','4']);
 assert.deepEqual(results.map(r=>[r.correct,r.answer,r.expected]),[[true,' 2 ','2'],[true,'4','4 or four'],[false,'','6']]);
 assert.equal(score,67);
 assert.equal(markPracticeSet(questions,'nonsense',q=>accepted[q.templateId!],()=>true).answers.length,0);
 assert.equal(hintsUsed([true,0,1,'']),2);assert.equal(hintsUsed(undefined),0);
});
test('only a UUID can name a practice session',()=>{
 assert.equal(isSessionId('00000000-0000-4000-8000-000000000001'),true);
 for(const bad of ['',undefined,null,'nope','00000000-0000-4000-8000-00000000000']) assert.equal(isSessionId(bad),false);
});
