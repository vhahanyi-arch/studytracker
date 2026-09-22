// Runs the question-engine content harnesses that guard generated practice
// questions. These are separate from `pnpm test` (the marking-engine suite)
// because they compile the engine and generate hundreds of thousands of
// question sets, so they are slow and report via JSON rather than node:test.
//
// The AS harnesses compare against tmp/9702/compiled/physics-question-engine.js,
// so that artifact is rebuilt from lib/ first -- otherwise a stale compile
// silently tests the previous engine.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import ts from 'typescript';

const COMPILED = 'tmp/9702/compiled/physics-question-engine.js';

function compileEngine() {
  const source = readFileSync('lib/physics-question-engine.ts', 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  });
  mkdirSync('tmp/9702/compiled', { recursive: true });
  writeFileSync(COMPILED, outputText);
  console.log(`compiled ${COMPILED} (${outputText.length} bytes)`);
}

compileEngine();

const harnesses = readdirSync('scripts')
  .filter((name) => name.startsWith('test-') && name.endsWith('.mjs'))
  .sort();

let failed = 0;
let skipped = 0;
for (const name of harnesses) {
  try {
    execFileSync(process.execPath, [`scripts/${name}`], { stdio: 'pipe' });
    console.log(`  PASS ${name}`);
  } catch (error) {
    // Exit code 2 means the harness had no fixtures to run against, which is
    // not a regression. Reported separately so it can never read as a pass.
    if (error.status === 2) {
      skipped++;
      console.log(`  SKIP ${name}`);
      console.log(String(error.stdout ?? '').split('\n').filter(Boolean).slice(-2).map((l) => `       ${l}`).join('\n'));
      continue;
    }
    failed++;
    console.log(`  FAIL ${name}`);
    console.log(String(error.stdout ?? '').split('\n').slice(-15).join('\n'));
    console.log(String(error.stderr ?? '').split('\n').slice(-15).join('\n'));
  }
}

const passed = harnesses.length - failed - skipped;
console.log(`\n${passed}/${harnesses.length} content harnesses passed${skipped ? `, ${skipped} skipped` : ''}`);
process.exit(failed ? 1 : 0);
