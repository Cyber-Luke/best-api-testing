import { TestRegistry } from "./registry.js";
import { TestPlan, TestFnReturn } from "./types.js";
import { loadConfig } from "./config.js";
import {
  getCoverage,
  getCoverageByPrefix,
  checkThresholds,
  resetCoverage,
} from "./coverage.js";
import {
  existsSync,
  readdirSync,
  mkdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "fs";
import path from "path";
import process from "process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let ts: typeof import("typescript") | undefined;

const CACHE_ROOT = path.resolve(process.cwd(), ".best-cache/tests");

function ensureTs() {
  if (!ts) {
    try {
      ts = require("typescript");
    } catch {
      throw new Error(
        "TypeScript nicht installiert. Bitte 'npm i typescript' ausführen."
      );
    }
  }
}

function cachePathFor(file: string): string {
  const rel = path.relative(process.cwd(), file);
  // Preserve directory structure inside cache
  return path.join(CACHE_ROOT, rel.replace(/\.ts$/, ".js"));
}

async function compileTestFile(file: string): Promise<string> {
  ensureTs();
  const outFile = cachePathFor(file);
  const outDir = path.dirname(outFile);
  mkdirSync(outDir, { recursive: true });
  const needs = (() => {
    if (!existsSync(outFile)) return true;
    try {
      const src = statSync(file).mtimeMs;
      const out = statSync(outFile).mtimeMs;
      return src > out;
    } catch {
      return true;
    }
  })();
  if (needs) {
    console.log(`  Transpiling: ${path.relative(process.cwd(), file)}`);
    const sourceText = readFileSync(file, "utf8");
    const result = ts!.transpileModule(sourceText, {
      compilerOptions: {
        module: ts!.ModuleKind.ESNext,
        target: ts!.ScriptTarget.ES2022,
        moduleResolution: ts!.ModuleResolutionKind.NodeNext,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true,
        sourceMap: false,
        isolatedModules: true,
        skipLibCheck: true,
      },
      fileName: file,
      reportDiagnostics: true,
    });
    if (result.diagnostics?.length) {
      const diag = result.diagnostics
        .map((d) => ts!.flattenDiagnosticMessageText(d.messageText, "\n"))
        .join("\n");
      console.warn("  TypeScript diagnostics:\n" + diag);
    }
    writeFileSync(outFile, result.outputText, "utf8");
  }
  return outFile;
}

async function loadTestFiles(testDir: string, pattern?: string): Promise<void> {
  if (!existsSync(testDir))
    throw new Error(`Test directory not found: ${testDir}`);
  console.log(`Loading tests from: ${testDir}`);
  TestRegistry.clear();

  const tsTests: string[] = [];
  const jsTests: string[] = [];

  const find = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".best-cache", "dist"].includes(entry.name))
          continue;
        find(full);
      } else if (
        entry.isFile() &&
        /\.test\.(ts|js|mjs|cjs)$/.test(entry.name)
      ) {
        if (pattern && !entry.name.includes(pattern)) continue;
        if (entry.name.endsWith(".ts")) tsTests.push(full);
        else jsTests.push(full);
      }
    }
  };
  find(testDir);

  // Compile TS tests to cache & import
  for (const file of tsTests) {
    try {
      const compiled = await compileTestFile(file);
      const url = new URL(`file://${compiled}`);
      await import(url.href);
      console.log(`✓ Loaded: ${path.basename(file)}`);
    } catch (e: any) {
      console.warn(`⚠ Could not load test file ${file}: ${e.message}`);
    }
  }
  // Import native JS tests
  for (const file of jsTests) {
    try {
      const url = new URL(`file://${path.resolve(file)}`);
      await import(url.href);
      console.log(`✓ Loaded: ${path.basename(file)}`);
    } catch (e: any) {
      console.warn(`⚠ Could not load test file ${file}: ${e.message}`);
    }
  }
  if (tsTests.length)
    console.log(
      `🛠  Transpiled ${tsTests.length} TypeScript test file(s) into .best-cache`
    );
}

function formatCoverageTable(): string {
  const total = getCoverage();
  const queries = getCoverageByPrefix("query");
  const mutations = getCoverageByPrefix("mutation");

  let output = "\n📊 Coverage Report:\n";
  output += "┌─────────────┬───────┬─────────┬───────────┐\n";
  output += "│ Type        │ Total │ Covered │ Percent   │\n";
  output += "├─────────────┼───────┼─────────┼───────────┤\n";
  output += `│ Queries     │ ${queries.total
    .toString()
    .padStart(5)} │ ${queries.covered
    .toString()
    .padStart(7)} │ ${queries.percent.toFixed(1).padStart(8)}% │\n`;
  output += `│ Mutations   │ ${mutations.total
    .toString()
    .padStart(5)} │ ${mutations.covered
    .toString()
    .padStart(7)} │ ${mutations.percent.toFixed(1).padStart(8)}% │\n`;
  output += "├─────────────┼───────┼─────────┼───────────┤\n";
  output += `│ Total       │ ${total.total
    .toString()
    .padStart(5)} │ ${total.covered.toString().padStart(7)} │ ${total.percent
    .toFixed(1)
    .padStart(8)}% │\n`;
  output += "└─────────────┴───────┴─────────┴───────────┘\n";

  return output;
}

function formatCoverageSummary(): string {
  const total = getCoverage();
  return `Coverage: ${total.covered}/${total.total} (${total.percent.toFixed(
    1
  )}%)`;
}

export interface RunOptions {
  pattern?: string;
  coverageFormat?: "table" | "json" | "summary";
}
export interface TestResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage?: any;
}

async function buildGeneratedCache(): Promise<void> {
  const cfg = loadConfig();
  const generatedDir = path.resolve(process.cwd(), cfg.generatedDir);
  if (!existsSync(generatedDir)) return; // nothing to do
  ensureTs();

  const srcFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && full.endsWith(".ts")) srcFiles.push(full);
    }
  };
  walk(generatedDir);

  for (const file of srcFiles) {
    const rel = path.relative(process.cwd(), file); // e.g. api-integration-tests/graphql/queries/index.ts
    const outFile = path.join(CACHE_ROOT, rel.replace(/\.ts$/, ".js"));
    const outDir = path.dirname(outFile);
    mkdirSync(outDir, { recursive: true });

    const needs = (() => {
      if (!existsSync(outFile)) return true;
      try {
        return statSync(file).mtimeMs > statSync(outFile).mtimeMs;
      } catch {
        return true;
      }
    })();
    if (!needs) continue;

    const sourceText = readFileSync(file, "utf8");
    const result = ts!.transpileModule(sourceText, {
      compilerOptions: {
        module: ts!.ModuleKind.ESNext,
        target: ts!.ScriptTarget.ES2022,
        moduleResolution: ts!.ModuleResolutionKind.NodeNext,
        esModuleInterop: true,
        isolatedModules: true,
        skipLibCheck: true,
      },
      fileName: file,
      reportDiagnostics: false,
    });

    let output = result.outputText;
    // Fix relative import to dist/framework when moved into cache (depth increases by '.best-cache/tests/')
    const distFrameworkAbs = path.resolve(process.cwd(), "dist/framework");
    const relFromOutToDist = path
      .relative(path.dirname(outFile), distFrameworkAbs)
      .replace(/\\/g, "/");
    // Replace any occurrences of previously computed relative path to dist/framework (heuristic)
    output = output.replace(
      /(['"`])([^'"`]*?)dist\/framework\//g,
      (_m, q, pre) => {
        // If pre already contains relFromOutToDist skip; else replace path before dist/framework
        return q + relFromOutToDist + "/";
      }
    );

    writeFileSync(outFile, output, "utf8");
  }
}

export async function runTests(options: RunOptions = {}): Promise<TestResult> {
  const config = loadConfig();
  resetCoverage();
  // Build generated client cache first so tests can import '../graphql/index.js'
  await buildGeneratedCache();
  try {
    await loadTestFiles(config.testDir, options.pattern);
  } catch (error) {
    throw new Error(`Failed to load tests: ${(error as Error).message}`);
  }

  const tests = TestRegistry.list().filter(
    (t) => !options.pattern || t.name.includes(options.pattern)
  );

  if (tests.length === 0) {
    console.log("No tests found.");
    return { success: true, totalTests: 0, passedTests: 0, failedTests: 0 };
  }

  let passed = 0;
  const failed: string[] = [];

  console.log(
    `Running ${tests.length} test${tests.length === 1 ? "" : "s"}...\n`
  );

  for (const t of tests) {
    const start = Date.now();
    let plan: TestPlan | undefined;
    try {
      const res: TestFnReturn = await t.fn();
      if (res && typeof res === "object" && "execute" in res) {
        plan = res as TestPlan;
        // Inject auth handling based on meta if needed
        if (t.meta?.authStrategy) {
          const strategy = t.meta.authStrategy;
          const originalExecute = plan.execute;
          plan.execute = async () => {
            const ctx = await originalExecute();
            if (strategy.type === "bearer") {
              const token = strategy.token || (await strategy.getToken?.());
              if (token) (ctx as any).authToken = token;
            } else if (strategy.type === "basic") {
              (ctx as any).authBasic = {
                username: strategy.username,
                password: strategy.password,
              };
            } else if (strategy.type === "custom") {
              const headers = await strategy.getHeaders();
              (ctx as any).customAuthHeaders = headers;
            }
            return ctx;
          };
        }
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
          } catch (e) {
            console.warn("Cleanup error", e);
          }
        }
      }
      passed++;
      console.log(`✔ ${t.name} (${Date.now() - start}ms)`);
    } catch (e: any) {
      failed.push(t.name);
      console.error(`✖ ${t.name}: ${e.message}`);
    }
  }

  console.log(`\n${passed}/${tests.length} passed`);

  // Show coverage if enabled
  if (config.coverage.enabled) {
    const format = options.coverageFormat || config.coverage.reportFormats[0];

    if (format === "table") {
      console.log(formatCoverageTable());
    } else if (format === "summary") {
      console.log(formatCoverageSummary());
    } else if (format === "json") {
      console.log(JSON.stringify(getCoverage(), null, 2));
    }

    // Check thresholds
    if (config.coverage.failOnBelow) {
      const thresholdResult = checkThresholds({
        minPercentTotal: config.coverage.minPercentTotal,
        minPercentQueries: config.coverage.minPercentQueries,
        minPercentMutations: config.coverage.minPercentMutations,
      });

      if (!thresholdResult.passed) {
        console.error("\n❌ Coverage thresholds not met:");
        thresholdResult.failures.forEach((failure) =>
          console.error(`  • ${failure}`)
        );
        return {
          success: false,
          totalTests: tests.length,
          passedTests: passed,
          failedTests: failed.length,
          coverage: getCoverage(),
        };
      }
    }
  }

  const success = passed === tests.length;

  return {
    success,
    totalTests: tests.length,
    passedTests: passed,
    failedTests: failed.length,
    coverage: getCoverage(),
  };
}

// Legacy export for backward compatibility
export async function run(options: RunOptions = {}) {
  const result = await runTests(options);
  if (!result.success) {
    process.exitCode = 1;
  }
}
