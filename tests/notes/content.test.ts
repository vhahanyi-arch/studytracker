import {test} from 'node:test';import assert from 'node:assert/strict';
import {parseNotes,plainText} from '@/lib/notes-markdown';
import {asPhysicsNotes} from '@/lib/as-physics-notes.generated';
import {asPhysicsUnits} from '@/lib/portal-content';
import {notesByUnit,renderModule} from '../../scripts/generate-as-physics-notes.mjs';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

// An edit to docs/as-physics-notes/ that is not regenerated would ship stale
// notes without any other check noticing.
test('the generated module matches the markdown notes',()=>{
 const onDisk=readFileSync(join(process.cwd(),'lib','as-physics-notes.generated.ts'),'utf8').replace(/\r\n?/g,'\n');
 assert.equal(onDisk,renderModule(notesByUnit()),'run `pnpm notes:as` and commit the result');
});

// Every topic card offers its notes, so every topic must have some.
test('every AS topic has notes, and every note has a topic',()=>{
 assert.deepEqual(Object.keys(asPhysicsNotes).sort(),asPhysicsUnits.map(u=>u.id).sort());
});

// Markup a student should never see, whatever a future edit to the notes adds.
const LEAKS:Array<[string,RegExp]>=[
 ['caret shorthand',/\^/],['underscore shorthand',/_/],['bold markers',/\*\*/],['backtick',/`/],
 ['escaped pipe',/\\\|/],['backslash',/\\/],['local file path',/[A-Z]:\//],['repo file',/README\.md|\.json|\.png|\.mjs/],
 ['markdown link',/\]\(/],['markdown image',/!\[/],['table separator',/\|\s*-{3,}/],
];

for(const [id,markdown] of Object.entries(asPhysicsNotes)){
 test(`${id} renders with no raw markup`,()=>{
  const text=plainText(parseNotes(markdown));
  for(const [name,re] of LEAKS) assert.ok(!re.test(text),`${id} shows ${name}: ${JSON.stringify(text.match(re)?.input?.slice(Math.max(0,(text.search(re))-40),text.search(re)+40))}`);
 });
 test(`${id} opens with its title and has content`,()=>{
  const blocks=parseNotes(markdown);
  assert.equal(blocks[0].kind,'heading');assert.equal((blocks[0] as any).level,1);
  assert.ok(blocks.filter(b=>b.kind==='paragraph').length>=5);
  assert.ok(blocks.some(b=>b.kind==='table'),'every topic has a formula table');
 });
}

test('D.C. circuits shows the drawn symbol sheet exactly once',()=>{
 const figures=parseNotes(asPhysicsNotes['as-u10']).filter(b=>b.kind==='figure');
 assert.deepEqual(figures,[{kind:'figure',figure:'circuit-symbols'}]);
});

test('no other topic claims the symbol sheet',()=>{
 for(const [id,md] of Object.entries(asPhysicsNotes)) if(id!=='as-u10') assert.ok(!parseNotes(md).some(b=>b.kind==='figure'),id);
});

test('particle physics renders its decay equations as nuclides',()=>{
 const text=JSON.stringify(parseNotes(asPhysicsNotes['as-u11']));
 assert.ok((text.match(/"kind":"nuclide"/g)||[]).length>=20);
});
