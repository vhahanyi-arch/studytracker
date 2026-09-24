import {test} from 'node:test';import assert from 'node:assert/strict';
import {addCurrentScreenshots,cropsVersionOf} from '@/lib/exam-paper-screenshots';
import type {Paper} from '@/lib/physics-extraction-schema';

// 9702/22 was saved before screenshots existed, so every question showed its
// whole page; then its crops left out each part's opening. Papers with no or
// older crops get current ones on first load, once.
const paper=(id:string,over:Partial<Paper>={}):Paper=>({id,title:id,syllabus:'9702',status:'ready',revision:1,createdAt:'',warnings:[],files:[],
 questions:[{id:'1(a)',text:'',context:'',marks:2,topic:'',sourcePages:[4],references:[],issues:[]}],schemes:[],...over});
const found={'1(a)':[{page:4,x:0,y:0.08,width:1,height:0.2}]};
const old={'1(a)':[{page:4,x:0,y:0.5,width:1,height:0.1}]};
const quiet=()=>{};

test('a paper with no crops gets them, and they are saved with their version',async()=>{
 const saved:unknown[]=[];
 const [p]=await addCurrentScreenshots([paper('none')],2,async()=>found,async(id,_c,v)=>{saved.push([id,v]);},quiet);
 assert.deepEqual([p.crops,p.cropsVersion],[found,2]);assert.deepEqual(saved,[['none',2]]);
});
test('crops from before versions were recorded are redone',async()=>{
 const [p]=await addCurrentScreenshots([paper('v1',{crops:old})],2,async()=>found,async()=>{},quiet);
 assert.deepEqual(p.crops,found);
});
test('current crops are left alone, without reading the PDF',async()=>{
 const never=async()=>{throw Error('should not run');};
 const [p]=await addCurrentScreenshots([paper('v2',{crops:old,cropsVersion:2})],2,never,never,quiet);
 assert.equal(p.crops,old);
});
test('multiple-choice papers keep their own crops',async()=>{
 const never=async()=>{throw Error('should not run');};
 const [p]=await addCurrentScreenshots([paper('mcq',{kind:'multiple_choice',crops:old})],2,never,never,quiet);
 assert.equal(p.crops,old);
});
test('when the question paper cannot be read, the paper keeps what it had and nothing is saved',async()=>{
 const lines:string[]=[];let saves=0;
 const [p]=await addCurrentScreenshots([paper('v1',{crops:old})],2,async()=>undefined,async()=>{saves++;},l=>lines.push(l));
 assert.equal(p.crops,old);assert.equal(saves,0);assert.match(lines[0],/keeping what it had/);
});
test('a failed save still shows the new screenshots this time',async()=>{
 const lines:string[]=[];
 const [p]=await addCurrentScreenshots([paper('none')],2,async()=>found,async()=>{throw Error('db down');},l=>lines.push(l));
 assert.deepEqual(p.crops,found);assert.match(lines[0],/could not save .*db down/);
});
test('order and the other papers are kept',async()=>{
 const out=await addCurrentScreenshots([paper('a',{crops:old,cropsVersion:2}),paper('b'),paper('c',{crops:old,cropsVersion:2})],2,async()=>found,async()=>{},quiet);
 assert.deepEqual(out.map(p=>p.id),['a','b','c']);
});
test('versions: none is 0, crops without a version are 1',()=>{
 assert.deepEqual([cropsVersionOf(paper('a')),cropsVersionOf(paper('b',{crops:old})),cropsVersionOf(paper('c',{crops:old,cropsVersion:2}))],[0,1,2]);
});
