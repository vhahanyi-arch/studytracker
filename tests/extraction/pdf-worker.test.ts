import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// The browser loads pdf.js from the bundle but its worker from public/, and
// pdf.js refuses to run when the two differ ("The API version does not match
// the Worker version"). The pdfjs-dist 6 upgrade left the worker at 5.7.284,
// which broke every PDF shown in the browser until this was caught.
test('the public pdf.js worker is the installed pdfjs-dist version',()=>{
 const installed=JSON.parse(readFileSync('node_modules/pdfjs-dist/package.json','utf8')).version;
 const worker=readFileSync('public/pdf.worker.min.mjs','utf8');
 const shipped=worker.match(/"(\d+\.\d+\.\d+)"/)?.[1];
 assert.equal(shipped,installed,`public/pdf.worker.min.mjs is ${shipped}; copy node_modules/pdfjs-dist/build/pdf.worker.min.mjs over it`);
});
