#!/usr/bin/env node
import { runIntrospection } from './framework/introspect.js';
import { generateClients } from './framework/generate.js';
import { run } from './framework/runner.js';
import { loadConfig } from './framework/config.js';
import path from 'path';
import { readdirSync } from 'fs';

async function loadTests() {
  const testsDir = path.resolve(process.cwd(), 'dist/tests');
  const files = readdirSync(testsDir).filter((f) => f.endsWith('.js'));
  for (const f of files) {
    await import(path.join(testsDir, f));
  }
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (cmd === 'init') {
    console.log('Running introspection...');
    await runIntrospection();
    console.log('Generating client...');
    generateClients();
    console.log('Done.');
    return;
  }
  if (cmd === 'run') {
    const pattern = rest.find((a) => a.startsWith('--pattern='))?.split('=')[1];
    await loadTests();
    await run({ pattern });
    return;
  }
  if (cmd === 'print-config') {
    console.log(loadConfig());
    return;
  }
  console.log('Usage: cli <init|run|print-config>');
}

main().catch(console.error);
