// Run only after the standalone Electricity draft regression passes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const path='lib/physics-question-engine.ts';
let engine=fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n');
let body=fs.readFileSync('scripts/as-physics-u9.draft.mjs','utf8').replace(/\r\n/g,'\n').split('// BEGIN VERIFIED BODY\n')[1].split('// END VERIFIED BODY')[0];
body=body.replace('const structuredAsElectricity = (difficulty) =>','const structuredAsElectricity = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] =>')
  .replace('(id, objective, prompt, options, correct, hint, solution)','(id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion')
  .replace('(id, objective, prompt, answer, hint, solution)','(id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion');
const start='// BEGIN AS TOPIC 9\n',end='// END AS TOPIC 9\n';
if(engine.includes(start))engine=engine.slice(0,engine.indexOf(start))+engine.slice(engine.indexOf(end)+end.length);
assert.ok(engine.includes('const asTopics:'));
engine=engine.replace('const asTopics:',start+body+end+'\nconst asTopics:');
engine=engine.replace(/  "as-u9": structuredAsElectricity,\n/g,'');
engine=engine.replace('  "as-u8": structuredAsSuperposition,\n','  "as-u8": structuredAsSuperposition,\n  "as-u9": structuredAsElectricity,\n');
assert.match(engine,/"as-u9": structuredAsElectricity/);
fs.writeFileSync(path,engine);
