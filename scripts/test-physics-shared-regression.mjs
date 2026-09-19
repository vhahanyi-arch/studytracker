// Regression for shared validator/marking changes; not a scientific audit of legacy IGCSE content.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
let seed=6259702;
const math=Object.assign(Object.create(Math),{random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;}});
const exports={};
vm.runInNewContext(fs.readFileSync('tmp/9702/compiled/physics-question-engine.js','utf8'),{exports,Math:math});
const tiers=['foundational','application','reasoning'];
let sets=0,questions=0;
const decimals=new Map();
const units = [
  ...Array.from({length:21},(_,i)=>`igcse-u${i+1}`).filter(id=>exports.supportsPhysicsUnit('igcse',id)),
  ...Array.from({length:11},(_,i)=>`as-u${i+1}`).filter(id=>exports.supportsPhysicsUnit('as',id)),
];
for(const id of units) {
  for(const tier of tiers) for(let i=0;i<3000;i++) {
    const qs=exports.makePhysicsQuestions(id.startsWith('as-')?'as':'igcse',id,tier); sets++;
    assert.equal(qs.length,6);
    for(const q of qs) {
      questions++;
      for(const a of q.answers) assert.ok(exports.answerMatches(a,q.answers));
      if(/\d+\.\d{5,}/.test([q.prompt,...q.answers,q.solution].join(' '))) decimals.set(q.templateId,q.prompt);
    }
  }
}
const source=fs.readFileSync('lib/physics-question-engine.ts','utf8');
const body=units.filter(id=>id.startsWith('as-')).map(id=>{
  const n=id.slice(4);
  return source.split(`// BEGIN AS TOPIC ${n}`)[1].split(`// END AS TOPIC ${n}`)[0];
}).join('\n');
const ast=ts.createSourceFile('as.ts',body,ts.ScriptTarget.Latest,true);
let conditionals=0;
function visit(node) {
  if(ts.isConditionalExpression(node)) {
    conditionals++;
    assert.notEqual(node.whenTrue.getText(ast),node.whenFalse.getText(ast),'Identical conditional branches');
  }
  ts.forEachChild(node,visit);
}
visit(ast);
assert.equal([...decimals.keys()].filter(id=>id.startsWith('as-')).length,0);
console.log(JSON.stringify({units,sets,questions,sharedValidatorAndSelfMatchingFailures:0,asIdenticalBranchChecks:conditionals,asUglyDecimalTemplates:0,legacyUglyDecimalTemplates:[...decimals]},null,2));
