import {test} from 'node:test';import assert from 'node:assert/strict';
import {stepTimer,StepTimeout} from '@/lib/step-timer';

// A hung upload used to be killed silently at the platform's 300 s limit.
// Each step now fails on its own deadline, saying which step it was.
test('a step that hangs fails by name, long before the platform limit',async()=>{
 const lines:string[]=[];const timer=stepTimer('t',l=>lines.push(l));
 const started=Date.now();
 await assert.rejects(timer.step('Saving the PDFs',new Promise(()=>{}),50),(e:unknown)=>e instanceof StepTimeout&&/^Saving the PDFs took longer than 0 seconds/.test((e as Error).message));
 assert.ok(Date.now()-started<1000);
 assert.match(lines[0],/^\[t\] Saving the PDFs: FAILED after \d+ ms/);
});
test('each finished step is logged with its time, and its result passed on',async()=>{
 const lines:string[]=[];const timer=stepTimer('t',l=>lines.push(l));
 assert.equal(await timer.step('Reading',Promise.resolve(7),1000),7);
 assert.equal(await timer.step('Deferred',async()=>'lazy',1000),'lazy');
 timer.done();
 assert.deepEqual(lines.map(l=>l.replace(/\d+ ms/,'N ms')),['[t] Reading: N ms','[t] Deferred: N ms','[t] total: N ms']);
});
test('a step that fails keeps its own error',async()=>{
 const timer=stepTimer('t',()=>{});
 await assert.rejects(timer.step('Saving',Promise.reject(new Error('Blob store refused the write')),1000),/Blob store refused the write/);
});
