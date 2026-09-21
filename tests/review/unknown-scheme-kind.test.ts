import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {Scheme} from '@/lib/physics-extraction-schema';
import {demoPaper} from '@/lib/physics-exam-demo';
import {markAnswer} from '@/lib/physics-marking-engine';

const paper=demoPaper(),question=paper.questions[0];
const answer={questionId:question.id,mode:'typed' as const,text:'10 N',steps:{},file:null};
for(const kind of ['typo','future-kind',undefined,null]){
 for(const selfPractice of [false,true]){
  for(const minimal of [false,true]){
   test('unknown scheme kind without points: '+String(kind)+' selfPractice='+selfPractice+' minimal='+minimal,()=>{
    // Deliberately bypass the static type to model malformed runtime/external data.
    const raw:Record<string,unknown>=minimal?{marks:question.marks,kind}:{...paper.schemes[0],kind};
    delete raw.points;
    let result:ReturnType<typeof markAnswer>|undefined;
    assert.doesNotThrow(()=>{result=markAnswer(question,raw as unknown as Scheme,answer,selfPractice);});
    assert.equal(result!.status,'needs_review');
    assert.equal(result!.proposed,null);
    assert.equal(result!.final,null);
    assert.deepEqual(result!.points,[]);
    assert.equal(result!.reason,'Unrecognized mark scheme type: '+String(kind));
   });
  }
 }
}
