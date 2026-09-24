import {test} from 'node:test';import assert from 'node:assert/strict';
import {addMissingScreenshots} from '@/lib/exam-paper-screenshots';
import type {Paper} from '@/lib/physics-extraction-schema';

// 9702/22 was saved before screenshots existed, so every question showed its
// whole page. Older papers now get their crops on first load, once.
const paper=(id:string,crops?:Paper['crops']):Paper=>({id,title:id,syllabus:'9702',status:'ready',revision:1,createdAt:'',warnings:[],files:[],
 questions:[{id:'1(a)',text:'',context:'',marks:2,topic:'',sourcePages:[4],references:[],issues:[]}],schemes:[],...(crops?{crops}:{})});
const found={'1(a)':[{page:4,x:0,y:0.08,width:1,height:0.2}]};

test('a paper with no crops gets them, and they are saved',async()=>{
 const saved:string[]=[];
 const [p]=await addMissingScreenshots([paper('old')],async()=>found,async id=>{saved.push(id);},()=>{});
 assert.deepEqual(p.crops,found);assert.deepEqual(saved,['old']);
});
test('a paper that already has crops is left alone, without reading its PDF',async()=>{
 const own={'1(a)':[{page:4,x:0,y:0.5,width:1,height:0.1}]};
 const [p]=await addMissingScreenshots([paper('new',own)],async()=>{throw Error('should not read');},async()=>{throw Error('should not save');},()=>{});
 assert.deepEqual(p.crops,own);
});
test('when the question paper cannot be read, the paper is served as before and nothing is saved',async()=>{
 const lines:string[]=[];let saves=0;
 const [p]=await addMissingScreenshots([paper('old')],async()=>undefined,async()=>{saves++;},l=>lines.push(l));
 assert.equal(p.crops,undefined);assert.equal(saves,0);assert.match(lines[0],/showing whole pages/);
});
test('a failed save still shows the screenshots this time',async()=>{
 const lines:string[]=[];
 const [p]=await addMissingScreenshots([paper('old')],async()=>found,async()=>{throw Error('db down');},l=>lines.push(l));
 assert.deepEqual(p.crops,found);assert.match(lines[0],/could not save .*db down/);
});
test('order and the other papers are kept',async()=>{
 const out=await addMissingScreenshots([paper('a',found),paper('b'),paper('c',found)],async()=>found,async()=>{},()=>{});
 assert.deepEqual(out.map(p=>p.id),['a','b','c']);
});
