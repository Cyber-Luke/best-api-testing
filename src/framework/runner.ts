import { TestRegistry } from './registry.js';
import { TestPlan, TestFnReturn } from './types.js';

export interface RunOptions {
  pattern?: string;
}

export async function run(options: RunOptions = {}) {
  const tests = TestRegistry.list().filter(
    (t) => !options.pattern || t.name.includes(options.pattern),
  );
  let passed = 0;
  for (const t of tests) {
    const start = Date.now();
    let plan: TestPlan | undefined;
    try {
      const res: TestFnReturn = await t.fn();
      if (res && typeof res === 'object' && 'execute' in res) {
        plan = res as TestPlan;
        const ctx = await plan.execute();
        if (plan.effects?.length) {
          for (const eff of plan.effects) {
            const ok = await eff.validate(ctx);
            if (!ok) {
              throw new Error(
                typeof eff.onFailureMessage === 'function'
                  ? eff.onFailureMessage(ctx)
                  : eff.onFailureMessage || `Effect failed: ${eff.name}`,
              );
            }
          }
        }
        if (plan.cleanup) {
          try {
            await plan.cleanup(ctx);
          } catch (e) {
            console.warn('Cleanup error', e);
          }
        }
      }
      passed++;
      console.log(`✔ ${t.name} (${Date.now() - start}ms)`);
    } catch (e: any) {
      console.error(`✖ ${t.name}:`, e.message);
    }
  }
  console.log(`${passed}/${tests.length} passed`);
  if (passed !== tests.length) process.exitCode = 1;
}
