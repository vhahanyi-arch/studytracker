import {test} from 'node:test';import assert from 'node:assert/strict';
import {cleanBlobToken,describeBlobToken,repairBlobTokenEnv} from '@/lib/blob-token';

// Made up. Built in pieces so secret scanners don't mistake it for a real one.
const TOKEN=['vercel','blob','rw','FakeStore1234','FakeSecretabcdefghij0123456789'].join('_');

// The store page's copy button gives the whole .env line; a terminal paste can
// carry a control character. Both made every upload "Access denied".
test('a pasted .env line, quotes, spaces and control characters are stripped',()=>{
 for(const raw of[`BLOB_READ_WRITE_TOKEN="${TOKEN}"`,`export BLOB_READ_WRITE_TOKEN='${TOKEN}'`,` "${TOKEN}"\r\n`,`\u0016${TOKEN}`,`﻿${TOKEN}​`])
  assert.equal(cleanBlobToken(raw).token,TOKEN,JSON.stringify(raw));
 assert.deepEqual(cleanBlobToken(`BLOB_READ_WRITE_TOKEN="${TOKEN}"`).fixes,['the variable name','quotes']);
});
test('a clean token is left alone',()=>{
 assert.deepEqual(cleanBlobToken(TOKEN),{token:TOKEN,fixes:[]});
 assert.deepEqual(cleanBlobToken(undefined),{token:undefined,fixes:[]});
});

// The logs say what is wrong, never what the secret is.
test('the description names the store, or the shape, never the secret',()=>{
 assert.equal(describeBlobToken(TOKEN),'store_FakeStore1234');
 assert.equal(describeBlobToken('store_FakeStore1234'),'a store id, not a read-write token');
 assert.equal(describeBlobToken(undefined),'no BLOB_READ_WRITE_TOKEN set');
 const odd=describeBlobToken('sk-FakeSecretabcdefghij 0123456789');
 assert.equal(odd,'an unrecognised token (34 characters, 0 underscores, does not start vercel_blob_rw_, contains spaces, contains punctuation)');
 assert.ok(!odd.includes('FakeSecret'));
});

test('server start repairs the variable once, for every Blob call in the app',()=>{
 const before=process.env.BLOB_READ_WRITE_TOKEN;
 try{
  process.env.BLOB_READ_WRITE_TOKEN=`BLOB_READ_WRITE_TOKEN="${TOKEN}"`;
  const lines:string[]=[];repairBlobTokenEnv(l=>lines.push(l),l=>lines.push(l));
  assert.equal(process.env.BLOB_READ_WRITE_TOKEN,TOKEN);
  assert.match(lines[0],/had the variable name, quotes around it/);
  assert.equal(lines[1],'[blob] token is for store_FakeStore1234');
  assert.ok(lines.every(l=>!l.includes('FakeSecret')));
 }finally{if(before===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=before;}
});
