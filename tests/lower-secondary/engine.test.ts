import {test} from 'node:test';import assert from 'node:assert/strict';
import {stageUnits} from '@/lib/lower-secondary/units';
import {makeSet,TIERS,type Template} from '@/lib/lower-secondary/engine';
import {framework} from '@/lib/lower-secondary/framework';
import {answerMatches} from '@/lib/lower-secondary-question-engine';

// Every Stage 8 and 9 template is held to the same standard. Each rule here
// exists because the previous generators broke it.

const RUNS=150;
const tidy=(v:string)=>v.toLowerCase().replace(/\s+/g,'').replace(/[−–—]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/°/g,'').replace(/,/g,'');
const codes=new Set(framework.map(o=>o.code));
const tierLetter={foundational:'f',application:'a',reasoning:'r'} as const;

// Content from IGCSE, not the Lower Secondary framework, found in Stage 9.
// A pie chart's "sector" is Lower Secondary; the area of a circle's sector is not.
const OUT_OF_SCOPE=/\b(sin|cos|tan)\b|\bsine\b|cosine|trigonometr|quartile|interquartile|\bIQR\b|arc length|sector of (a|the) circle|area of (a|the) sector|sector area|negative scale factor/i;
const LINT:Array<[string,RegExp]>=[
 ['"1" with a plural noun',/\b1 (hours|minutes|seconds|days|weeks|months|years|times|people|items|students|games|trials|books|pens|boxes|tickets|questions)\b/],
 // Lowercase only: a capital A is usually a variable ("A = 2 × 3 and B ...").
 // And only after a word or at the start: "4a − 3a = a and 7b ..." is algebra.
 // Nor before a word no article can precede: "of a and b" is algebra too.
 ['"a" before a vowel sound',/(?:^|[A-Za-z,;:] )a (?!uni|use|one|eu|u\b|(?:and|or|is|are|in|of|on|at|as)\b)[aeiou]\w*/],
 // A single letter can take "an": "an n-sided base", "an x-coordinate".
 ['"an" before a consonant sound',/\ban (?!hour|honest|[aeiou8]|11|18|[fhlmnrsx](?![a-z]))[b-df-hj-np-tv-z]\w*/],
 ['a double space',/ {2}/],
 // A spaced colon is ratio notation (flour : sugar); a colon with no space after it is not.
 // ... after a list is an ellipsis (1, 3, 5, ...), not a stray full stop.
 ['a space before punctuation',/ [,;?]| \.(?!\.)| :(?! )/],
 ['an ASCII minus on a negative number',/(^|[\s(=,:])-\d/],
 ['leftover code',/NaN|undefined|Infinity|\[object|null\b/],
];

const units=Object.entries(stageUnits);

test('every Stage 8 and 9 unit is registered',()=>{
 assert.deepEqual(units.map(([u])=>u).sort(),[...new Set(framework.map(o=>o.unit))].sort());
});

for(const [unit,templates] of units){
 const stage=unit[1];

 test(`${unit}: template ids are unique and name their tier`,()=>{
  const ids=templates.map(t=>t.id);
  assert.equal(new Set(ids).size,ids.length,'duplicate template id');
  for(const t of templates) assert.match(t.id,new RegExp(`^${unit}-${tierLetter[t.tier]}\\d+$`),t.id);
 });

 test(`${unit}: every tier has a pool of at least eight templates`,()=>{
  for(const tier of TIERS) assert.ok(templates.filter(t=>t.tier===tier).length>=8,`${tier} has ${templates.filter(t=>t.tier===tier).length}`);
 });

 test(`${unit}: every template is tagged with this stage's objectives`,()=>{
  for(const t of templates){
   assert.ok(t.codes.length>0,`${t.id} has no objective codes`);
   for(const c of t.codes) assert.ok(c==='review'||(codes.has(c)&&c[0]===stage),`${t.id} is tagged ${c}`);
  }
 });

 for(const t of templates) test(`${t.id}: ${t.objective}`,()=>check(t));

 test(`${unit}: sets draw from the whole pool and do not repeat`,()=>{
  for(const tier of TIERS){
   const pool=templates.filter(t=>t.tier===tier).map(t=>t.id);
   const seen=new Set<string>();let overlap=0,previous:string[]=[];
   for(let i=0;i<RUNS;i++){
    const set=makeSet(unit,templates,tier);
    assert.equal(set.length,6);
    assert.equal(new Set(set.map(q=>q.prompt)).size,6,'duplicate prompt in a set');
    set.forEach(q=>seen.add(q.templateId));
    const prompts=set.map(q=>q.prompt);overlap+=prompts.filter(p=>previous.includes(p)).length;previous=prompts;
   }
   assert.deepEqual([...seen].sort(),[...pool].sort(),`${tier}: some templates are never chosen`);
   // Consecutive sets for the same student must not be memorisable.
   assert.ok(overlap/(RUNS-1)<0.5,`${tier}: consecutive sets share ${(overlap/(RUNS-1)).toFixed(2)} identical questions on average`);
  }
 });
}

function check(t:Template){
 const prompts=new Set<string>();
 for(let i=0;i<RUNS;i++){
  const q=t.make();
  prompts.add(q.prompt);
  const where=`${t.id}: ${JSON.stringify(q.prompt)}`;
  for(const field of [q.prompt,q.hint,q.solution,...q.answers]) assert.ok(typeof field==='string'&&field.trim()===field&&field.length>0,`${where} has an empty or untrimmed field`);
  assert.ok(q.answers.length>0,where);
  assert.ok(answerMatches(q.answers[0],q.answers),`${where}: its own answer ${JSON.stringify(q.answers[0])} does not mark as correct`);
  // The worked solution must actually reach the answer being marked.
  assert.ok(tidy(q.solution).includes(tidy(q.answers[0])),`${where}: answer ${JSON.stringify(q.answers[0])} is not in the solution ${JSON.stringify(q.solution)}`);
  assert.match(q.prompt,/[.?:)]$/,`${where} does not end as a sentence`);
  assert.ok(!OUT_OF_SCOPE.test(q.prompt+' '+q.solution),`${where} is outside the Lower Secondary framework`);
  for(const [name,re] of LINT) for(const text of [q.prompt,q.hint,q.solution]) assert.ok(!re.test(text),`${where} has ${name}: ${JSON.stringify(text.match(re)?.[0])} in ${JSON.stringify(text)}`);
 }
 // A template that always asks the same question can be passed from memory.
 assert.ok(prompts.size>=5,`${t.id} produced only ${prompts.size} different questions in ${RUNS} runs`);
}
