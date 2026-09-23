import {test} from 'node:test';import assert from 'node:assert/strict';
import {inline,symbols,nuclides,cells,forStudents,parseNotes,plainText,type Block} from '@/lib/notes-markdown';

const MINUS='\u2212';

// ---- symbols ---------------------------------------------------------------

test('an underscore after a symbol is a subscript',()=>{
 assert.deepEqual(symbols('R_total'),[{kind:'text',text:'R'},{kind:'sub',text:'total'}]);
});

test('a chained subscript reads as words',()=>{
 assert.deepEqual(symbols('E_transferred_in'),[{kind:'text',text:'E'},{kind:'sub',text:'transferred in'}]);
});

test('a subscript attaches to a Greek symbol',()=>{
 assert.deepEqual(symbols('η_total'),[{kind:'text',text:'η'},{kind:'sub',text:'total'}]);
});

// Without something to attach to, an underscore is just a character.
test('an underscore with no symbol before it stays text',()=>{
 assert.deepEqual(symbols('_x'),[{kind:'text',text:'_x'}]);
 assert.deepEqual(symbols('a _x'),[{kind:'text',text:'a _x'}]);
});

test('anti- before one particle letter is an overbar',()=>{
 assert.deepEqual(symbols('anti-d'),[{kind:'bar',text:'d'}]);
});

test('an antineutrino keeps its subscript under the bar',()=>{
 assert.deepEqual(symbols('anti-ν_e'),[{kind:'bar',text:'ν'},{kind:'sub',text:'e'}]);
});

// "anti-down" is a word in the notes ("an anti-down quark"), not notation.
test('anti- before a whole word is left alone',()=>{
 assert.deepEqual(symbols('an anti-down quark'),[{kind:'text',text:'an anti-down quark'}]);
});

test('anti inside a longer word is not a prefix',()=>{
 assert.deepEqual(symbols('xanti-d'),[{kind:'text',text:'xanti-d'}]);
});

// ---- nuclides --------------------------------------------------------------

test('a nuclide puts the nucleon number over the proton number',()=>{
 assert.deepEqual(nuclides('^238_92 U'),[{kind:'nuclide',mass:'238',atomic:'92',symbol:[{kind:'text',text:'U'}]}]);
});

test('grouping brackets in the shorthand are dropped',()=>{
 const [n]=nuclides('^(A−4)_(Z−2) Y') as any[];
 assert.equal(n.mass,'A−4');assert.equal(n.atomic,'Z−2');
});

test('a negative proton number uses a true minus sign',()=>{
 const [n]=nuclides('^0_-1 e') as any[];
 assert.equal(n.atomic,MINUS+'1');
});

test('a positive proton number keeps its plus sign',()=>{
 const [n]=nuclides('^0_+1 e') as any[];
 assert.equal(n.atomic,'+1');
});

test('a decay equation keeps the arrow and signs between its nuclides',()=>{
 const out=nuclides('^238_92 U → ^234_90 Th + ^4_2 α');
 assert.deepEqual(out.map(n=>n.kind),['nuclide','text','nuclide','text','nuclide']);
 assert.equal((out[1] as any).text,' → ');assert.equal((out[3] as any).text,' + ');
});

test('an antineutrino inside a nuclide gets its bar',()=>{
 const [n]=nuclides('^0_0 anti-ν_e') as any[];
 assert.deepEqual(n.symbol,[{kind:'bar',text:'ν'},{kind:'sub',text:'e'}]);
});

// ---- inline markdown -------------------------------------------------------

test('bold becomes strong',()=>{
 assert.deepEqual(inline('**Microwaves:** reflect'),[{kind:'strong',children:[{kind:'text',text:'Microwaves:'}]},{kind:'text',text:' reflect'}]);
});

test('a code span is read as nuclide notation',()=>{
 assert.equal(inline('`^14_6 C` has')[0].kind,'nuclide');
});

test('an external link stays a link',()=>{
 const [l]=inline('[NASA table](https://imagine.gsfc.nasa.gov/x.html)') as any[];
 assert.equal(l.kind,'link');assert.equal(l.href,'https://imagine.gsfc.nasa.gov/x.html');
});

// Relative links point into the repo, which a student cannot open.
test('a relative link keeps its words and loses its target',()=>{
 assert.deepEqual(inline('See [source and scope](README.md) now'),[{kind:'text',text:'See '},{kind:'text',text:'source and scope'},{kind:'text',text:' now'}]);
});

test('a link to a local file path is never rendered as a link',()=>{
 const out=inline('[supplied syllabus](C:/Users/USER/Downloads/s.pdf)');
 assert.ok(out.every(n=>n.kind!=='link'));
 assert.ok(!plainText(out).includes('C:/'));
});

test('an underscore in a link target is not a subscript',()=>{
 const [l]=inline('[chart](https://x.org/spectrum_chart.html)') as any[];
 assert.equal(l.href,'https://x.org/spectrum_chart.html');
});

// ---- tables ----------------------------------------------------------------

test('an escaped pipe is an absolute-value bar, not a cell border',()=>{
 assert.deepEqual(cells('| δx / \\|x\\| | ratio | use |'),['δx / |x|','ratio','use']);
});

test('a plain row splits into its cells',()=>{
 assert.deepEqual(cells('| a | b | c |'),['a','b','c']);
});

// ---- provenance --------------------------------------------------------------

test('a paragraph that is only source links is dropped',()=>{
 assert.equal(forStudents('Source: [supplied Cambridge syllabus](C:/x.pdf). More links.'),null);
});

test('the README pointer goes but the syllabus reference stays',()=>{
 assert.equal(forStudents('Source: syllabus, printed page 17; objectives 2.1.1–2.1.9. See [source and scope](README.md).'),
  'Source: syllabus, printed page 17; objectives 2.1.1–2.1.9.');
});

test('text after the README pointer is kept',()=>{
 assert.equal(forStudents('Page 20. See [source and scope](README.md). Two more notes.'),'Page 20. Two more notes.');
});

// ---- blocks ----------------------------------------------------------------

const kinds=(b:Block[])=>b.map(x=>x.kind);

test('headings keep their level',()=>{
 const b=parseNotes('# One\n\n## Two\n\n### Three') as any[];
 assert.deepEqual(b.map(x=>x.level),[1,2,3]);
});

test('a table needs its separator row',()=>{
 const b=parseNotes('| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |') as any[];
 assert.equal(b[0].kind,'table');assert.equal(b[0].head.length,2);assert.equal(b[0].rows.length,2);
});

test('consecutive bullets form one list',()=>{
 const b=parseNotes('- one\n- two\n- three') as any[];
 assert.deepEqual(kinds(b),['list']);assert.equal(b[0].items.length,3);
});

test('wrapped paragraph lines join with a space',()=>{
 assert.equal(plainText(parseNotes('first line\nsecond line')),'first line second line\n');
});

// The syllabus sheet is two page images; the app draws one figure for both.
test('the two circuit-symbol pages become one drawn figure',()=>{
 const b=parseNotes('![p61](assets/syllabus-circuit-symbols-61.png)\n\n![p62](assets/syllabus-circuit-symbols-62.png)');
 assert.deepEqual(b,[{kind:'figure',figure:'circuit-symbols'}]);
});

test('an image with no drawn figure is dropped rather than shown broken',()=>{
 assert.deepEqual(parseNotes('![x](assets/unknown.png)'),[]);
});

// Each of these once sent the parser into an endless loop: every block type
// declined the line, so nothing consumed it. A test timeout cannot catch that
// -- a synchronous loop never yields to the timer -- so the parser guards its
// own progress and throws; these tests then fail instead of hanging the run.
test('a table row with no separator becomes text instead of hanging',{timeout:2000},()=>{
 assert.deepEqual(kinds(parseNotes('| lonely | row |\nafter')),['paragraph']);
});

// A Unicode line separator mid-line defeats the heading pattern's `.*`, so the
// line starts like a heading without matching as one.
test('a line that starts like a heading but is not one does not hang',{timeout:2000},()=>{
 assert.equal(parseNotes('# a b').length,1);
});

test('a malformed separator does not hang',{timeout:2000},()=>{
 assert.ok(parseNotes('| a | b |\n|-|-|\n| 1 | 2 |').length>0);
});

test('Windows line endings parse the same as Unix ones',{timeout:2000},()=>{
 const md='# T\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n- x\n- y\n';
 assert.deepEqual(parseNotes(md.replace(/\n/g,'\r\n')),parseNotes(md));
});
