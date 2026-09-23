import {test} from 'node:test';import assert from 'node:assert/strict';
import {startExtractionFromImages,checkExtraction} from '@/lib/physics-exam-extraction';import {demoPaper} from '@/lib/physics-exam-demo';
const p=demoPaper();const data={questions:p.questions,schemes:p.schemes,warnings:[],syllabus:'0625'};
const images=[{role:'combined' as const,images:[{page:1,dataUrl:'data:image/png;base64,AAA='}]}];
const pages={questionPages:[1],schemePages:[1]};
// Runs fn against a fake provider, restoring fetch and the key afterwards.
async function withProvider(fake:typeof fetch,fn:()=>Promise<void>){
 const old=globalThis.fetch,key=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='test-only';globalThis.fetch=fake;
 try{await fn();}finally{globalThis.fetch=old;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;}
}
const finished=(over:Record<string,unknown>={},text=JSON.stringify(data))=>Response.json({status:'completed',output:[{content:[{type:'output_text',text}]}],...over});

// A whole paper takes longer than a serverless function may run, so the
// request must start in background mode and return at once.
test('provider starts in the background, from page images, with a strict schema and no storage',async()=>{
 await withProvider(async(url,init)=>{
  assert.equal(String(url),'https://api.openai.com/v1/responses');assert.equal(init?.method,'POST');
  const b=JSON.parse(String(init?.body));
  assert.equal(b.background,true);assert.equal(b.store,false);assert.equal(b.text.format.strict,true);
  assert.ok(b.input[0].content.some((c:{type:string})=>c.type==='input_image'));
  return Response.json({id:'resp_123',status:'queued'});
 },async()=>{
  assert.deepEqual(await startExtractionFromImages(images),{responseId:'resp_123',pages});
 });
});
test('a provider refusal to start is reported',async()=>{
 await withProvider(async()=>Response.json({error:{code:'insufficient_quota'}},{status:429}),async()=>{
  await assert.rejects(()=>startExtractionFromImages(images),/HTTP 429 \(insufficient_quota\)/);
 });
});
for(const status of ['queued','in_progress'])test(`a response that is ${status} is still running`,async()=>{
 await withProvider(async(url)=>{assert.match(String(url),/\/v1\/responses\/resp_123$/);return Response.json({status});},async()=>{
  assert.deepEqual(await checkExtraction('resp_123',pages),{state:'running'});
 });
});
test('a finished response becomes the extraction',async()=>{
 await withProvider(async()=>finished(),async()=>{
  const state=await checkExtraction('resp_123',pages);
  assert.equal(state.state,'done');assert.equal(state.state==='done'&&state.extraction.questions[0].id,'5(a)');
 });
});
// OpenAI deletes an unstored background result about ten minutes after it finishes.
test('a result that was never collected in time is reported as such',async()=>{
 await withProvider(async()=>Response.json({error:{}},{status:404}),async()=>{
  await assert.rejects(()=>checkExtraction('resp_123',pages),/not collected in time/);
 });
});
for(const scenario of ['refusal','incomplete','failed','wrong-page','invalid-json','rate-limit'])test('provider rejects '+scenario,async()=>{
 await withProvider(async()=>{
  if(scenario==='rate-limit')return Response.json({error:{}},{status:429});
  const d=structuredClone(data);if(scenario==='wrong-page')d.questions[0].sourcePages=[99];
  if(scenario==='refusal')return Response.json({status:'completed',output:[{content:[{type:'refusal'}]}]});
  return finished(scenario==='incomplete'||scenario==='failed'?{status:scenario}:{},scenario==='invalid-json'?'broken':JSON.stringify(d));
 },async()=>{
  await assert.rejects(()=>checkExtraction('resp_123',pages));
 });
});
