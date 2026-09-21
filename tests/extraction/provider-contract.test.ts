import {test} from 'node:test';import assert from 'node:assert/strict';
import {extractImages} from '@/lib/physics-exam-extraction';import {demoPaper} from '@/lib/physics-exam-demo';
const p=demoPaper();const data={questions:p.questions,schemes:p.schemes,warnings:[],syllabus:'0625'};
const images=[{role:'combined' as const,images:[{page:1,dataUrl:'data:image/png;base64,AAA='}]}];
test('provider uses page images, strict schema, no response storage',async()=>{
 const old=globalThis.fetch,key=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='test-only';
 globalThis.fetch=async(_url,init)=>{const b=JSON.parse(String(init?.body));assert.equal(b.store,false);assert.equal(b.text.format.strict,true);assert.ok(b.input[0].content.some((c:{type:string})=>c.type==='input_image'));return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(data)}]}]});};
 try{assert.equal((await extractImages(images)).questions[0].id,'5(a)');}finally{globalThis.fetch=old;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;}
});
for(const scenario of ['refusal','incomplete','wrong-page','invalid-json','rate-limit'])test('provider rejects '+scenario,async()=>{
 const old=globalThis.fetch,key=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='test-only';
 globalThis.fetch=async()=>{if(scenario==='rate-limit')return Response.json({error:{}},{status:429});const d=structuredClone(data);if(scenario==='wrong-page')d.questions[0].sourcePages=[99];return Response.json({status:scenario==='incomplete'?'incomplete':'completed',output:[{content:scenario==='refusal'?[{type:'refusal'}]:[{type:'output_text',text:scenario==='invalid-json'?'broken':JSON.stringify(d)}]}]});};
 try{await assert.rejects(()=>extractImages(images));}finally{globalThis.fetch=old;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;}
});
