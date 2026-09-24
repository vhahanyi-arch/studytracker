import { z } from 'zod';
import { ExtractionSchema, type Paper, type Submission, type Answer, type StoredFile } from './physics-extraction-schema';
import { validateExtraction } from './physics-exam-extraction-validation';
import { markAnswer } from './physics-marking-engine';
export function approvePaper(paper:Paper,raw:unknown):Paper {
 const extraction=validateExtraction(ExtractionSchema.parse(raw));
 if(!extraction.questions.length||extraction.questions.some(q=>q.issues.length))throw Error('Resolve every question issue before publishing.');
 return {...paper,...extraction,status:'ready',revision:paper.revision+1};
}
const AnswerInput=z.object({questionId:z.string(),mode:z.enum(['typed','handwritten']),text:z.string().max(20000),steps:z.record(z.string(),z.string().max(10000)),fileId:z.string().nullable(),
 // Formula/working are optional, student-supplied context for calculation questions.
 // They are never read by markAnswer or compareNumeric -- only `text` is graded --
 // so accepting them here cannot change any already-verified grading behavior.
 formula:z.string().max(2000).optional(),working:z.string().max(10000).optional()});
export const SubmitSchema=z.object({paperId:z.string(),name:z.string().trim().min(1).max(100),selfPractice:z.boolean(),answers:z.array(AnswerInput).max(250),
 // File IDs for a student who handwrote the entire paper rather than per-question.
 // Resolved to StoredFile objects by the caller (the same way individual answers'
 // fileId is already resolved) before being passed into makeSubmission.
 wholePaperFiles:z.array(z.string()).max(50).optional()});
export function makeSubmission(paper:Paper,name:string,selfPractice:boolean,answers:Answer[],wholePaperFiles?:StoredFile[]):Submission{
 if(paper.status!=='ready')throw Error('A teacher must verify this paper first.');
 if(new Set(answers.map(a=>a.questionId)).size!==answers.length||answers.length!==paper.questions.length||answers.some(a=>!paper.questions.some(q=>q.id===a.questionId)))throw Error('Submit exactly one answer for every question.');
 // A handwritten answer needs evidence: either its own attached file, or the
 // submission has whole-paper page images covering it instead.
 const hasWholePaper=!!wholePaperFiles&&wholePaperFiles.length>0;
 if(!hasWholePaper&&answers.some(a=>a.mode==='handwritten'&&!a.file))throw Error('Attach a handwritten answer, upload the whole paper, or switch that question to typed.');
 return {id:crypto.randomUUID(),paperId:paper.id,paperRevision:paper.revision,name,selfPractice,answers,createdAt:new Date().toISOString(),
  wholePaperFiles:hasWholePaper?wholePaperFiles:undefined,
  grades:paper.questions.map(q=>markAnswer(q,paper.schemes.find(s=>s.questionId===q.id),answers.find(a=>a.questionId===q.id)!,selfPractice))};
}
// One answer marked on its own while practising. The expected answer is part
// of the result, which is why the route records every check.
export const CheckSchema=z.object({paperId:z.string().uuid(),questionId:z.string().max(40),text:z.string().max(20000),steps:z.record(z.string(),z.string().max(10000)).default({})});
export function checkAnswer(paper:Paper,input:z.infer<typeof CheckSchema>){
 const q=paper.questions.find(x=>x.id===input.questionId);if(!q)throw Error('Question not found.');
 const g=markAnswer(q,paper.schemes.find(s=>s.questionId===q.id),{questionId:q.id,mode:'typed',text:input.text,steps:input.steps,file:null},true);
 return {questionId:q.id,marks:q.marks,proposed:g.proposed,status:g.status,reason:g.reason,expected:g.expected,points:g.points};
}
export function overrideGrade(submission:Submission,questionId:string,score:number,note:string,paper:Paper):Submission{
 const q=paper.questions.find(q=>q.id===questionId); if(!q||!Number.isInteger(score)||score<0||score>q.marks)throw Error('Enter a whole mark within the question maximum.');
 if(!note.trim())throw Error('Add a review note for the audit trail.');
 const result=structuredClone(submission); const grade=result.grades.find(g=>g.questionId===questionId); if(!grade)throw Error('Grade not found.');
 grade.final=score; grade.status='confirmed'; grade.history.push({score,note:note.trim(),at:new Date().toISOString()}); return result;
}
