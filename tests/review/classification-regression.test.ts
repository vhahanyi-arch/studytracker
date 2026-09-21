import {test} from 'node:test';import assert from 'node:assert/strict';
import {demoPaper} from '@/lib/physics-exam-demo';import {markAnswer} from '@/lib/physics-marking-engine';
const p=demoPaper(),a={questionId:'5(a)',mode:'typed' as const,text:'10 N',steps:{},file:null};
test('misclassified explanation still requires review',()=>assert.equal(markAnswer({...p.questions[0],text:'Explain why the force is 10 N.'},p.schemes[0],a,true).proposed,null));
for(const note of ['accept ecf','any two of the following','3 significant figures required','show your working'])
 test('special note preserved '+note,()=>assert.equal(markAnswer(p.questions[0],{...p.schemes[0],notes:[note]},a,true).proposed,null));
