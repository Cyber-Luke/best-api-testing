#!/usr/bin/env node
import prompts from "prompts";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import {
  loadConfig,
  saveConfig,
  type FrameworkConfig,
  type AuthConfig,
} from "./framework/config.js";
import { runIntrospection } from "./framework/introspect.js";
import { generateClients } from "./framework/generate.js";
import { runTests } from "./framework/runner.js";
import colors from "picocolors";

interface CLIArgs {
  command: string;
  flags: {
    yes?: boolean;
    force?: boolean;
    noGenerate?: boolean;
    pattern?: string;
    coverageReport?: "json" | "table" | "summary";
    help?: boolean;
  };
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const flags: CLIArgs["flags"] = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--yes" || arg === "-y") flags.yes = true;
    else if (arg === "--force") flags.force = true;
    else if (arg === "--no-generate") flags.noGenerate = true;
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg.startsWith("--pattern=")) flags.pattern = arg.split("=")[1];
    else if (arg.startsWith("--coverage-report=")) {
      const format = arg.split("=")[1] as "json" | "table" | "summary";
      if (["json", "table", "summary"].includes(format)) {
        flags.coverageReport = format;
      }
    }
  }

  return { command, flags };
}

function showHelp() {
  console.log(`
${colors.bold(colors.cyan("BEST - GraphQL API Testing Framework"))}

${colors.bold("USAGE:")}
  best <command> [options]

${colors.bold("COMMANDS:")}
  init                    Interactive setup of configuration and project structure
  run [pattern]           Run tests matching optional pattern
  generate               Generate GraphQL client code
  coverage               Show coverage report
  help                   Show this help message

${colors.bold("OPTIONS:")}
  --yes, -y              Use defaults for all prompts (non-interactive)
  --force                Force overwrite existing files
  --no-generate          Skip automatic code generation
  --pattern=<glob>       Run tests matching glob pattern
  --coverage-report=<fmt> Coverage report format (table|json|summary)
  --help, -h             Show help

${colors.bold("EXAMPLES:")}
  best init                           # Interactive setup
  best init --yes                     # Quick setup with defaults
  best run                            # Run all tests
  best run --pattern="**/auth*"       # Run tests matching pattern
  best run --coverage-report=json     # Run tests with JSON coverage report
  best generate                       # Regenerate GraphQL client
`);
}

async function createExampleTest(
  testDir: string,
  force: boolean = false
): Promise<void> {
  const examplePath = path.join(testDir, "example.test.ts");

  if (existsSync(examplePath) && !force) {
    console.log(colors.yellow("ℹ Example test already exists, skipping..."));
    return;
  }

  const exampleContent = `import { Test } from 'best-api-testing';
import { queries } from '../graphql/index.js';

export class ExampleTests {
  @Test
  static async healthCheck() {
    return {
      execute: async () => {
        // This is a basic example - replace with your actual GraphQL operations
        // const result = await queries.someQuery();
        // return { result };
        
        // For now, just a simple test
        return { status: 'ok' };
      },
      effects: [
        {
          name: 'health-check-passes',
          validate: (ctx) => ctx.status === 'ok',
          onFailureMessage: 'Health check failed',
        },
      ],
    };
  }
}`;

  writeFileSync(examplePath, exampleContent);
  console.log(colors.green("✅ Created example test file"));
}

async function createExampleDecorator(outputRoot: string, force = false) {
  const decoDir = path.join(outputRoot, "decorators");
  mkdirSync(decoDir, { recursive: true });
  const file = path.join(decoDir, "example.decorator.ts");
  if (existsSync(file) && !force) return;
  const content = `import { createTestDecorator } from 'best-api-testing';

// Example custom decorator adding a timing and tagging the test
export const ExampleDecorator = createTestDecorator({
  tags: ['example','timing'],
  description: 'Adds execution duration to context.durationMs',
  transformPlan: (plan) => ({
    ...plan,
    execute: async () => {
      const start = Date.now();
      const ctx = await plan.execute();
      (ctx as any).durationMs = Date.now() - start;
      return ctx;
    }
  })
});
`;
  writeFileSync(file, content, "utf8");
}

async function initCommand(flags: CLIArgs["flags"]): Promise<void> {
  console.log(colors.bold(colors.cyan("\n🚀 BEST Framework Setup\n")));

  const config = loadConfig();
  let answers: any = {};

  if (!flags.yes) {
    answers = await prompts([
      {
        type: "text",
        name: "endpoint",
        message: "GraphQL endpoint URL:",
        initial: config.endpoint,
        validate: (value: string) =>
          value.trim() ? true : "Endpoint is required",
      },
      {
        type: "select",
        name: "authType",
        message: "Authentication type:",
        choices: [
          { title: "None", value: "none" },
          { title: "Basic Auth", value: "basic" },
          { title: "Bearer Token", value: "bearer" },
        ],
        initial:
          config.auth.type === "none"
            ? 0
            : config.auth.type === "basic"
            ? 1
            : 2,
      },
      {
        type: (prev) => (prev === "basic" ? "text" : null),
        name: "username",
        message: "Username:",
        initial:
          config.auth.type === "basic" ? (config.auth as any).username : "",
      },
      {
        type: (prev, values) =>
          values.authType === "basic" ? "password" : null,
        name: "password",
        message: "Password:",
        initial:
          config.auth.type === "basic" ? (config.auth as any).password : "",
      },
      {
        type: (prev, values) =>
          values.authType === "bearer" ? "password" : null,
        name: "token",
        message: "Bearer token:",
        initial:
          config.auth.type === "bearer" ? (config.auth as any).token : "",
      },
      {
        type: "text",
        name: "outputRoot",
        message: "Output directory:",
        initial: config.outputRoot,
        validate: (value: string) =>
          value.trim() ? true : "Output directory is required",
      },
      {
        type: "confirm",
        name: "enableCoverage",
        message: "Enable coverage tracking?",
        initial: config.coverage.enabled,
      },
      {
        type: (prev) => (prev ? "number" : null),
        name: "minCoverage",
        message: "Minimum total coverage percentage:",
        initial: config.coverage.minPercentTotal || 50,
        min: 0,
        max: 100,
      },
    ]);

    if (!answers.endpoint) {
      console.log(colors.red("Setup cancelled."));
      process.exit(1);
    }
  }

  // Build new config
  const newConfig: FrameworkConfig = {
    endpoint: answers.endpoint || config.endpoint,
    auth: buildAuthConfig(answers),
    headers: config.headers,
    schemaFile: `${answers.outputRoot || config.outputRoot}/schema.json`,
    outputRoot: answers.outputRoot || config.outputRoot,
    generatedDir: `${answers.outputRoot || config.outputRoot}/graphql`,
    testDir: `${answers.outputRoot || config.outputRoot}/tests`,
    coverage: {
      enabled:
        answers.enableCoverage !== undefined
          ? answers.enableCoverage
          : config.coverage.enabled,
      failOnBelow: config.coverage.failOnBelow,
      minPercentTotal: answers.minCoverage || config.coverage.minPercentTotal,
      minPercentQueries: config.coverage.minPercentQueries,
      minPercentMutations: config.coverage.minPercentMutations,
      reportFormats: config.coverage.reportFormats,
    },
  };

  // Create directories
  mkdirSync(newConfig.testDir, { recursive: true });
  mkdirSync(newConfig.outputRoot, { recursive: true });

  // Save config
  saveConfig(newConfig);
  console.log(colors.green("✅ Configuration saved to best.config.json"));

  // Create example test
  await createExampleTest(newConfig.testDir, flags.force);
  await createExampleDecorator(newConfig.outputRoot, flags.force);

  // Create .gitignore for generated files
  const gitignorePath = path.join(newConfig.outputRoot, ".gitignore");
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, "graphql/\nschema.json\n");
    console.log(colors.green("✅ Created .gitignore file"));
  }

  // Run introspection and generation
  console.log(colors.cyan("\n🔍 Running introspection..."));
  try {
    await runIntrospection();
    console.log(colors.green("✅ Schema introspection completed"));

    console.log(colors.cyan("🛠️ Generating GraphQL client..."));
    generateClients();
    console.log(colors.green("✅ GraphQL client generated"));

    console.log(
      colors.bold(colors.green("\n🎉 Setup completed successfully!"))
    );
    console.log(colors.dim("Next steps:"));
    console.log(colors.dim("  1. Edit tests in " + newConfig.testDir));
    console.log(colors.dim("  2. Run tests with: best run"));
  } catch (error) {
    console.log(
      colors.yellow("⚠️ Setup completed, but code generation failed:")
    );
    console.log(colors.red((error as Error).message));
    console.log(colors.dim("You can retry with: best generate"));
  }
}

function buildAuthConfig(answers: any): AuthConfig {
  if (answers.authType === "basic") {
    return {
      type: "basic",
      username: answers.username,
      password: answers.password,
    };
  } else if (answers.authType === "bearer") {
    return { type: "bearer", token: answers.token };
  }
  return { type: "none" };
}

async function generateCommand(): Promise<void> {
  console.log(colors.cyan("🔍 Running introspection..."));
  try {
    await runIntrospection();
    console.log(colors.green("✅ Schema introspection completed"));

    console.log(colors.cyan("🛠️ Generating GraphQL client..."));
    generateClients();
    console.log(colors.green("✅ GraphQL client generated"));
  } catch (error) {
    console.log(colors.red("❌ Generation failed:"));
    console.log(colors.red((error as Error).message));
    process.exit(1);
  }
}

async function runCommand(flags: CLIArgs["flags"]): Promise<void> {
  const config = loadConfig();

  // Auto-generate unless explicitly disabled
  if (!flags.noGenerate) {
    try {
      await runIntrospection();
      generateClients();
    } catch (error) {
      console.log(
        colors.yellow(
          "⚠️ Code generation failed, continuing with existing code..."
        )
      );
    }
  }

  try {
    const result = await runTests({
      pattern: flags.pattern,
      coverageFormat: flags.coverageReport || config.coverage.reportFormats[0],
    });

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.log(colors.red("❌ Test execution failed:"));
    console.log(colors.red((error as Error).message));
    process.exit(1);
  }
}

async function coverageCommand(): Promise<void> {
  // This would show coverage from last run - for now just redirect to run
  console.log(colors.cyan("Coverage report from last test run:"));
  // Implementation would load coverage data from file if we persist it
  console.log(colors.dim("Run tests first with: best run"));
}

async function main(): Promise<void> {
  const { command, flags } = parseArgs();

  if (flags.help || command === "help") {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case "init":
        await initCommand(flags);
        break;
      case "run":
        await runCommand(flags);
        break;
      case "generate":
        await generateCommand();
        break;
      case "coverage":
        await coverageCommand();
        break;
      default:
        console.log(colors.red(`Unknown command: ${command}`));
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("cancelled")) {
      console.log(colors.yellow("Operation cancelled."));
      process.exit(0);
    }
    console.error(colors.red("Error:"), error);
    process.exit(1);
  }
}

main().catch(console.error);
