import { TestRegistry } from "./registry.js";
export async function run(options = {}) {
    const tests = TestRegistry.list().filter((t) => !options.pattern || t.name.includes(options.pattern));
    if (tests.length === 0) {
        console.log("No tests found" +
            (options.pattern ? ` matching pattern "${options.pattern}"` : ""));
        return;
    }
    console.log(`Running ${tests.length} test(s)${options.pattern ? ` (pattern: "${options.pattern}")` : ""}...\n`);
    let passed = 0;
    const results = [];
    for (const t of tests) {
        const start = Date.now();
        let plan;
        let status = "failed";
        let error;
        try {
            const res = await t.fn();
            if (res && typeof res === "object" && "execute" in res) {
                plan = res;
                const ctx = await plan.execute();
                if (plan.effects?.length) {
                    for (const eff of plan.effects) {
                        const ok = await eff.validate(ctx);
                        if (!ok) {
                            throw new Error(typeof eff.onFailureMessage === "function"
                                ? eff.onFailureMessage(ctx)
                                : eff.onFailureMessage || `Effect failed: ${eff.name}`);
                        }
                    }
                }
                if (plan.cleanup) {
                    try {
                        await plan.cleanup(ctx);
                    }
                    catch (cleanupError) {
                        console.warn(`⚠️  Cleanup warning for ${t.name}:`, cleanupError.message);
                    }
                }
            }
            passed++;
            status = "passed";
            const duration = Date.now() - start;
            console.log(`✔ ${t.name} (${duration}ms)`);
            results.push({ name: t.name, status, duration });
        }
        catch (e) {
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
    }
    else {
        console.log("🎉 All tests passed!");
    }
}
//# sourceMappingURL=runner.js.map