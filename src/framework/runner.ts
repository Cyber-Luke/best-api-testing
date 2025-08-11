import { TestRegistry } from "./registry.js";
import { TestPlan, TestFnReturn, RunOptions } from "./types.js";

export async function run(options: RunOptions = {}) {
  const tests = TestRegistry.list().filter(
    (t) => !options.pattern || t.name.includes(options.pattern)
  );

  if (tests.length === 0) {
    console.log(
      "No tests found" +
        (options.pattern ? ` matching pattern "${options.pattern}"` : "")
    );
    return;
  }

  console.log(
    `Running ${tests.length} test(s)${
      options.pattern ? ` (pattern: "${options.pattern}")` : ""
    }...\n`
  );

  let passed = 0;
  const results: Array<{
    name: string;
    status: "passed" | "failed";
    duration: number;
    error?: string;
  }> = [];

  for (const t of tests) {
    const start = Date.now();
    let plan: TestPlan | undefined;
    let status: "passed" | "failed" = "failed";
    let error: string | undefined;

    try {
      const res: TestFnReturn = await t.fn();
      if (res && typeof res === "object" && "execute" in res) {
        plan = res as TestPlan;
        const ctx = await plan.execute();

        if (plan.effects?.length) {
          for (const eff of plan.effects) {
            const ok = await eff.validate(ctx);
            if (!ok) {
              throw new Error(
                typeof eff.onFailureMessage === "function"
                  ? eff.onFailureMessage(ctx)
                  : eff.onFailureMessage || `Effect failed: ${eff.name}`
              );
            }
          }
        }

        if (plan.cleanup) {
          try {
            await plan.cleanup(ctx);
          } catch (cleanupError: any) {
            console.warn(
              `⚠️  Cleanup warning for ${t.name}:`,
              cleanupError.message
            );
          }
        }
      }

      passed++;
      status = "passed";
      const duration = Date.now() - start;
      console.log(`✔ ${t.name} (${duration}ms)`);
      results.push({ name: t.name, status, duration });
    } catch (e: any) {
      const duration = Date.now() - start;
      error = e.message || "Unknown error";
      console.error(`✖ ${t.name} (${duration}ms): ${error}`);
      results.push({ name: t.name, status, duration, error });
    }
  }

  console.log(`\n${passed}/${tests.length} passed`);

  if (passed !== tests.length) {
    console.log("\nFailed tests:");
    results
      .filter((r) => r.status === "failed")
      .forEach((r) => {
        console.log(`  • ${r.name}: ${r.error}`);
      });
    process.exitCode = 1;
  } else {
    console.log("🎉 All tests passed!");
  }
}
