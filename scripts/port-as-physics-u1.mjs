// Run only after the standalone draft regression passes.
import fs from 'node:fs';
const path = 'lib/physics-question-engine.ts';
let engine = fs.readFileSync(path,'utf8');
let body = fs.readFileSync('scripts/as-physics-u1.draft.mjs','utf8').split('// BEGIN VERIFIED BODY\n')[1].split('// END VERIFIED BODY')[0];
body = body.replace('const structuredAsQuantities = (difficulty) =>', 'const structuredAsQuantities = (difficulty: "foundational"|"application"|"reasoning"): PhysicsQuestion[] =>')
  .replace('(id, objective, prompt, options, correct, hint, solution)', '(id: string, objective: string, prompt: string, options: string[], correct: number, hint: string, solution: string): PhysicsQuestion')
  .replace('(id, objective, prompt, answer, hint, solution)', '(id: string, objective: string, prompt: string, answer: number, hint: string, solution: string): PhysicsQuestion')
  .replace("const estimate = r", "const estimate: [string, string[]] = r")
  .replace("const prefix = [[", "const prefix: [string, string, number] = ([[")
  .replace("['tera','T',12]][r(0,9)];", "['tera','T',12]] as [string, string, number][])[r(0,9)];")
  .replace("{kg:['kilogram'", "({kg:['kilogram'")
  .replace("K:['kelvin','kelvins']}[base[1]]", "K:['kelvin','kelvins']} as Record<string,string[]>)[base[1]]");
const start = '// BEGIN AS TOPIC 1\n', end = '// END AS TOPIC 1\n';
if(engine.includes(start)) engine = engine.slice(0,engine.indexOf(start))+engine.slice(engine.indexOf(end)+end.length);
engine = engine.replace('const asTopics:', start+body+end+'\nconst asTopics:');
engine = engine.replace(/(const asTopics:[^\n]+\{\r?\n)(?:  "as-u1": structuredAsQuantities,\r?\n)?/, '$1  "as-u1": structuredAsQuantities,\n');
fs.writeFileSync(path,engine);
