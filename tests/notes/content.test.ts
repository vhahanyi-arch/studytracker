import {test} from 'node:test';import assert from 'node:assert/strict';
import {parseNotes,plainText} from '@/lib/notes-markdown';
import {asPhysicsNotes} from '@/lib/as-physics-notes.generated';
import {igcsePhysicsNotes} from '@/lib/igcse-physics-notes.generated';
import {stage7MathsNotes} from '@/lib/stage-7-maths-notes.generated';
import {stage8MathsNotes} from '@/lib/stage-8-maths-notes.generated';
import {stage9MathsNotes} from '@/lib/stage-9-maths-notes.generated';
import {asPhysicsUnits,igcsePhysicsUnits,stage7Chapters,stage8Units,stage9Units} from '@/lib/portal-content';
import {framework,objectivesFor} from '@/lib/lower-secondary/framework';
import {igcsePhysicsSyllabus} from '@/lib/physics-syllabus';
import {LEVELS,notesByUnit,renderModule} from '../../scripts/generate-revision-notes.mjs';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';

const LEVEL_NOTES={stage7:{notes:stage7MathsNotes,units:stage7Chapters},as:{notes:asPhysicsNotes,units:asPhysicsUnits},igcse:{notes:igcsePhysicsNotes,units:igcsePhysicsUnits},stage8:{notes:stage8MathsNotes,units:stage8Units},stage9:{notes:stage9MathsNotes,units:stage9Units}} as const;
const MATHS_NOTES={...stage8MathsNotes,...stage9MathsNotes};
const ALL_NOTES={...asPhysicsNotes,...igcsePhysicsNotes,...stage7MathsNotes,...MATHS_NOTES};

for(const [level,{notes,units}] of Object.entries(LEVEL_NOTES) as Array<[keyof typeof LEVELS,(typeof LEVEL_NOTES)[keyof typeof LEVEL_NOTES]]>){
 // An edit to the markdown notes that is not regenerated would ship stale
 // notes without any other check noticing.
 test(`the generated ${level} module matches the markdown notes`,()=>{
  const onDisk=readFileSync(join(process.cwd(),'lib',LEVELS[level].module),'utf8').replace(/\r\n?/g,'\n');
  assert.equal(onDisk,renderModule(level,notesByUnit(level)),'run `pnpm notes` and commit the result');
 });

 // Every topic card offers its notes, so every topic must have some.
 test(`every ${level} topic has notes, and every note has a topic`,()=>{
  assert.deepEqual(Object.keys(notes).sort(),units.map(u=>u.id).sort());
 });
}

// Markup a student should never see, whatever a future edit to the notes adds.
const LEAKS:Array<[string,RegExp]>=[
 ['caret shorthand',/\^/],['underscore shorthand',/_/],['bold markers',/\*\*/],['backtick',/`/],
 ['escaped pipe',/\\\|/],['backslash',/\\/],['local file path',/[A-Z]:\//],['repo file',/README\.md|\.json|\.png|\.mjs|\.ts\b/],
 ['markdown link',/\]\(/],['markdown image',/!\[/],['table separator',/\|\s*-{3,}/],
];

for(const [id,markdown] of Object.entries(ALL_NOTES)){
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
 for(const [id,md] of Object.entries(ALL_NOTES)) if(id!=='as-u10') assert.ok(!parseNotes(md).some(b=>b.kind==='figure'),id);
});

test('particle physics renders its decay equations as nuclides',()=>{
 const text=JSON.stringify(parseNotes(asPhysicsNotes['as-u11']));
 assert.ok((text.match(/"kind":"nuclide"/g)||[]).length>=20);
});

const headings=(markdown:string,level:number)=>parseNotes(markdown).filter((b:any)=>b.kind==='heading'&&b.level===level).map((b:any)=>plainText(b.children));

// Worked examples of each formula in use, at both levels.
for(const [id,markdown] of Object.entries(asPhysicsNotes)){
 test(`${id} has worked situations`,()=>{
  assert.ok(headings(markdown,2).includes('Using the formulas in different situations'),`${id} has no worked situations section`);
  assert.ok(headings(markdown,3).filter(h=>h.startsWith('Situation:')).length>=3,`${id} has fewer than three worked situations`);
 });
}

// ---- IGCSE -------------------------------------------------------------------

// Which syllabus sections each IGCSE practice unit covers, from the unit titles
// in portal-content. Every section of the syllabus belongs to exactly one unit.
const IGCSE_SECTIONS:Record<string,string[]>={
 'igcse-u1':['1.1'],'igcse-u2':['1.2'],'igcse-u3':['1.3','1.4'],'igcse-u4':['1.5.1','1.5.2','1.5.3'],
 'igcse-u5':['1.6'],'igcse-u6':['1.7.1','1.7.2','1.7.3','1.7.4'],'igcse-u7':['1.8'],
 'igcse-u8':['2.1.1','2.1.2','2.1.3'],'igcse-u9':['2.2.1','2.2.2','2.2.3'],'igcse-u10':['2.3.1','2.3.2','2.3.3','2.3.4'],
 'igcse-u11':['3.1'],'igcse-u12':['3.2.1','3.2.2','3.2.3','3.2.4'],'igcse-u13':['3.3','3.4'],
 'igcse-u14':['4.1'],'igcse-u15':['4.2.1','4.2.2','4.2.3','4.2.4','4.2.5'],'igcse-u16':['4.3.1','4.3.2','4.3.3'],
 'igcse-u17':['4.4'],'igcse-u18':['4.5.1','4.5.2','4.5.3','4.5.4','4.5.5','4.5.6'],
 'igcse-u19':['5.1.1','5.1.2'],'igcse-u20':['5.2.1','5.2.2','5.2.3','5.2.4','5.2.5'],
 'igcse-u21':['6.1.1','6.1.2','6.2.1','6.2.2','6.2.3'],
};

test('the IGCSE units between them cover every syllabus section once',()=>{
 const sections=Object.values(IGCSE_SECTIONS).flat();
 assert.deepEqual([...sections].sort(),igcsePhysicsSyllabus.flatMap(t=>t.groups.map(g=>g.id)).sort());
 assert.deepEqual(Object.keys(IGCSE_SECTIONS).sort(),igcsePhysicsUnits.map(u=>u.id).sort());
});

for(const [id,sections] of Object.entries(IGCSE_SECTIONS)){
 // A section with no heading citing it is a section the notes forgot.
 test(`${id} has a concept heading for each of its syllabus sections`,()=>{
  const cited=headings(igcsePhysicsNotes[id],3).join('\n');
  for(const section of sections){
   const pattern=new RegExp(`(?<![\\d.])${section.replace(/\./g,'\\.')}(?![\\d.]*\\d)`);
   assert.ok(pattern.test(cited),`${id} has no heading citing ${section}`);
  }
 });
 // The shape students rely on: concepts, the formulas, how to use them, and the checks.
 test(`${id} has concepts, formulas, worked situations and exam checks`,()=>{
  const sectionsInOrder=headings(igcsePhysicsNotes[id],2);
  assert.equal(sectionsInOrder[0],'Concept summary');
  assert.ok(sectionsInOrder.some(h=>h.startsWith('Key ')),`${id} has no key formulas or key ideas section`);
  assert.ok(sectionsInOrder.some(h=>h.startsWith('Using the ')),`${id} has no worked situations`);
  assert.equal(sectionsInOrder.at(-1),'Exam checks');
  assert.ok(headings(igcsePhysicsNotes[id],3).filter(h=>h.startsWith('Situation:')).length>=3,`${id} has fewer than three worked situations`);
 });
}

test('IGCSE nuclear units render their equations as nuclides',()=>{
 for(const id of ['igcse-u19','igcse-u20']){
  const text=JSON.stringify(parseNotes(igcsePhysicsNotes[id]));
  assert.ok((text.match(/"kind":"nuclide"/g)||[]).length>=15,id);
 }
});

// ---- Stage 8 and 9 maths ---------------------------------------------------------

test('every Stage 8 and 9 objective code is in a practice unit that has notes',()=>{
 const units=new Set(framework.map(o=>o.unit));
 for(const unit of units) assert.ok(MATHS_NOTES[unit],`${unit} has objectives but no notes`);
});

for(const [id,markdown] of Object.entries(MATHS_NOTES)){
 // An objective with no heading citing it is an objective the notes forgot.
 test(`${id} has a heading citing each of its framework objectives`,()=>{
  const cited=headings(markdown,3).join('\n');
  const codes=objectivesFor(id).map(o=>o.code);
  assert.ok(codes.length>0,`${id} has no objectives in the framework`);
  for(const code of codes) assert.ok(cited.includes(code),`${id} has no heading citing ${code}`);
 });
 // The shape students rely on: ideas, the facts and formulas, how to use them, and the pitfalls.
 test(`${id} has key ideas, formulas, worked situations and common mistakes`,()=>{
  const sections=headings(markdown,2);
  assert.equal(sections[0],'Key ideas');
  assert.ok(sections.includes('Key facts and formulas'),`${id} has no facts and formulas section`);
  assert.ok(sections.includes('Using the methods in different situations'),`${id} has no worked situations`);
  assert.equal(sections.at(-1),'Common mistakes');
  assert.ok(headings(markdown,3).filter(h=>h.startsWith('Situation:')).length>=3,`${id} has fewer than three worked situations`);
 });
}

// ---- Stage 7 maths --------------------------------------------------------------

// Stage 7 notes are foundations, organised by the app's chapters. The project
// holds no Stage 7 objective list, so they cite no codes (none may be invented),
// and instead end by naming the Stage 8 units that build on them.
const STAGE_8_TITLES=new Set(stage8Units.map(u=>u.title));
const listItems=(markdown:string,section:string)=>{
 const blocks=parseNotes(markdown);
 const start=blocks.findIndex((b:any)=>b.kind==='heading'&&b.level===2&&plainText(b.children)===section);
 const list=blocks.slice(start+1).find((b:any)=>b.kind==='list') as any;
 return start<0||!list?[]:list.items.map((item:any)=>plainText(item));
};

for(const [id,markdown] of Object.entries(stage7MathsNotes)){
 test(`Stage 7 ${id} has key ideas, formulas, worked situations, mistakes and where it leads`,()=>{
  const sections=headings(markdown,2);
  assert.equal(sections[0],'Key ideas');
  assert.ok(sections.includes('Key facts and formulas'),`${id} has no facts and formulas section`);
  assert.ok(sections.includes('Using the methods in different situations'),`${id} has no worked situations`);
  assert.deepEqual(sections.slice(-2),['Common mistakes','Where this leads']);
  assert.ok(headings(markdown,3).filter(h=>h.startsWith('Situation:')).length>=3,`${id} has fewer than three worked situations`);
 });
 test(`Stage 7 ${id} names only real Stage 8 units in "Where this leads"`,()=>{
  const items=listItems(markdown,'Where this leads');
  assert.ok(items.length>=1,`${id} names no Stage 8 unit`);
  for(const item of items){
   const title=item.match(/^Stage 8 · (.+?): /)?.[1];
   assert.ok(title&&STAGE_8_TITLES.has(title),`${id}: "${item}" does not name a Stage 8 unit title`);
  }
 });
 test(`Stage 7 ${id} cites no objective codes`,()=>{
  assert.ok(!/\b\d[A-Z][a-z]\.\d\d\b/.test(markdown),`${id} cites an objective code`);
 });
}

test('the Stage 7 notes are titled in chapter order',()=>{
 const titles=Object.values(stage7MathsNotes).map(md=>plainText((parseNotes(md)[0] as any).children));
 assert.deepEqual(titles,stage7Chapters.map((c,i)=>`Chapter ${i+1} — ${c.title}`));
});

// Known issues #12: Cambridge's syllabus pages are not published in this public
// repo. The notes link to the circuit-symbol pages only as markers for the
// drawn figure, so no image or PDF belongs anywhere under docs/.
test('no syllabus page images or PDFs are committed under docs/',()=>{
 const walk=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);
 assert.deepEqual(walk('docs').filter(file=>/\.(png|jpe?g|gif|webp|pdf)$/i.test(file)),[]);
});
