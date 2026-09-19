// Run only after the standalone Dynamics draft regression passes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const path='lib/physics-question-engine.ts';
let engine=fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n');
let body=fs.readFileSync('scripts/as-physics-u3.draft.mjs','utf8').replace(/\r\n/g,'\n').split('// BEGIN VERIFIED BODY\n')[1].split('// END VERIFIED BODY')[0];
body=body.replace('const structuredAsDynamics = (difficulty) =>','const structuredAsDynamics = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] =>')
  .replace('(id, objective, prompt, options, correct, hint, solution)','(id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion')
  .replace('(id, objective, prompt, answer, hint, solution)','(id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion');
const start='// BEGIN AS TOPIC 3\n',end='// END AS TOPIC 3\n';
if(engine.includes(start))engine=engine.slice(0,engine.indexOf(start))+engine.slice(engine.indexOf(end)+end.length);
assert.ok(engine.includes('const asTopics:'));
engine=engine.replace('const asTopics:',start+body+end+'\nconst asTopics:');
engine=engine.replace(/  "as-u3": structuredAsDynamics,\n/g,'');
engine=engine.replace('  "as-u2": structuredAsKinematics,\n','  "as-u2": structuredAsKinematics,\n  "as-u3": structuredAsDynamics,\n');
assert.match(engine,/"as-u3": structuredAsDynamics/);
fs.writeFileSync(path,engine);
