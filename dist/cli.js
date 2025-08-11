#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";
import { runIntrospection } from "./framework/introspect.js";
import { generateClients } from "./framework/generate.js";
import { run } from "./framework/runner.js";
import { loadConfig } from "./framework/config.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function promptForProjectConfig() {
    console.log(chalk.blue.bold("\n🚀 Welcome to BEST GraphQL Integration Testing Framework\n"));
    console.log(chalk.gray("Let's set up your integration test project!\n"));
    const responses = await prompts([
        {
            type: "text",
            name: "endpoint",
            message: "GraphQL endpoint URL:",
            initial: "http://localhost:4000/graphql",
            validate: (value) => {
                try {
                    new URL(value);
                    return true;
                }
                catch {
                    return "Please enter a valid URL";
                }
            },
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
            initial: 0,
        },
        {
            type: (prev) => (prev === "basic" ? "text" : null),
            name: "username",
            message: "Username:",
            validate: (value) => value.length > 0 ? true : "Username cannot be empty",
        },
        {
            type: (prev, values) => (values.authType === "basic" ? "password" : null),
            name: "password",
            message: "Password:",
            validate: (value) => value.length > 0 ? true : "Password cannot be empty",
        },
        {
            type: (prev, values) => (values.authType === "bearer" ? "text" : null),
            name: "token",
            message: "Bearer token:",
            validate: (value) => (value.length > 0 ? true : "Token cannot be empty"),
        },
        {
            type: "text",
            name: "customHeaders",
            message: "Additional headers (JSON format, optional):",
            initial: "{}",
            validate: (value) => {
                if (!value.trim())
                    return true;
                try {
                    JSON.parse(value);
                    return true;
                }
                catch {
                    return "Please enter valid JSON format";
                }
            },
        },
    ]);
    if (!responses.endpoint) {
        console.log(chalk.red("\n❌ Setup cancelled."));
        process.exit(1);
    }
    const auth = { type: responses.authType };
    if (responses.authType === "basic") {
        auth.username = responses.username;
        auth.password = responses.password;
    }
    else if (responses.authType === "bearer") {
        auth.token = responses.token;
    }
    let headers = {};
    if (responses.customHeaders && responses.customHeaders.trim()) {
        try {
            headers = JSON.parse(responses.customHeaders);
        }
        catch {
            console.log(chalk.yellow("⚠️  Invalid headers JSON, using empty headers"));
        }
    }
    return {
        endpoint: responses.endpoint,
        auth,
        headers,
        schemaFile: "schema.json",
        generatedDir: "src/graphql",
    };
}
async function initProject(projectName) {
    const targetDir = projectName || "api-integration-tests";
    const projectDir = path.resolve(process.cwd(), targetDir);
    if (existsSync(projectDir)) {
        const response = await prompts({
            type: "confirm",
            name: "overwrite",
            message: `Directory ${targetDir} already exists. Overwrite?`,
            initial: false,
        });
        if (!response.overwrite) {
            console.log(chalk.red("❌ Setup cancelled."));
            process.exit(1);
        }
    }
    console.log(chalk.green(`\n📁 Creating integration test project: ${targetDir}\n`));
    // Create main directory
    mkdirSync(projectDir, { recursive: true });
    // Get configuration from user
    const config = await promptForProjectConfig();
    // Create directory structure
    const graphqlDir = path.join(projectDir, config.generatedDir);
    const testsDir = path.join(projectDir, "src", "tests");
    mkdirSync(graphqlDir, { recursive: true });
    mkdirSync(testsDir, { recursive: true });
    // Copy templates
    const templatesDir = path.join(__dirname, "..", "templates");
    if (existsSync(templatesDir)) {
        cpSync(templatesDir, projectDir, { recursive: true });
    }
    // Create package.json
    const packageJson = {
        name: targetDir,
        version: "1.0.0",
        private: true,
        type: "module",
        scripts: {
            build: "tsc",
            init: "best init",
            test: "best run",
            "test:watch": "best run --watch",
        },
        devDependencies: {
            best: "latest",
            typescript: "^5.7.3",
            "@types/node": "^24.2.1",
        },
    };
    writeFileSync(path.join(projectDir, "package.json"), JSON.stringify(packageJson, null, 2));
    // Create TypeScript config
    const tsConfig = {
        compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "node",
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            outDir: "./dist",
            rootDir: "./src",
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
    };
    writeFileSync(path.join(projectDir, "tsconfig.json"), JSON.stringify(tsConfig, null, 2));
    // Create integration test config
    writeFileSync(path.join(projectDir, "integration-test.config.json"), JSON.stringify(config, null, 2));
    // Create example test file
    const exampleTest = `import { Test } from 'best/dist/framework/decorators.js';
import { queries, types } from '../graphql/index.js';

export class ExampleTests {
  @Test
  static async basicHealthCheck() {
    return {
      execute: async () => {
        // Add your GraphQL queries here
        // const data = await queries.someQuery();
        return { status: 'healthy' };
      },
      effects: [
        {
          name: 'health-check-passes',
          validate: (ctx) => ctx.status === 'healthy',
          onFailureMessage: 'Health check should pass'
        }
      ]
    };
  }

  @Test
  static async exampleQuery() {
    return {
      execute: async () => {
        // Example: Query your GraphQL endpoint
        // Uncomment and modify based on your schema:
        // const data = await queries.yourQuery();
        // return { data };
        
        return { message: 'Replace this with actual GraphQL queries' };
      },
      effects: [
        {
          name: 'query-successful',
          validate: (ctx) => ctx.message !== undefined,
          onFailureMessage: 'Query should return data'
        }
      ],
      cleanup: async (ctx) => {
        // Optional cleanup logic
        console.log('🧹 Test cleanup completed');
      }
    };
  }
}
`;
    writeFileSync(path.join(testsDir, "example.test.ts"), exampleTest);
    // Create README
    const readme = `# ${targetDir}

GraphQL Integration Tests powered by BEST Framework

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Initialize GraphQL client (run this after any schema changes):
   \`\`\`bash
   npm run init
   \`\`\`

3. Build and run tests:
   \`\`\`bash
   npm run build
   npm test
   \`\`\`

## Configuration

Your GraphQL endpoint and authentication settings are configured in \`integration-test.config.json\`.

## Writing Tests

See \`src/tests/example.test.ts\` for examples. Tests are written using decorators:

\`\`\`typescript
@Test
static async myTest() {
  return {
    execute: async () => {
      const data = await queries.someQuery();
      return { data };
    },
    effects: [
      {
        name: 'data-validation',
        validate: (ctx) => ctx.data !== null,
        onFailureMessage: 'Data should not be null'
      }
    ]
  };
}
\`\`\`

## Commands

- \`npm run init\` - Generate GraphQL client from schema
- \`npm test\` - Run all tests
- \`npm run build\` - Build TypeScript
`;
    writeFileSync(path.join(projectDir, "README.md"), readme);
    console.log(chalk.green.bold("\n✅ Project created successfully!\n"));
    console.log(chalk.white("📋 Next steps:\n"));
    console.log(chalk.cyan(`   cd ${targetDir}`));
    console.log(chalk.cyan("   npm install"));
    console.log(chalk.cyan("   npm run init        # Generate GraphQL client"));
    console.log(chalk.cyan("   npm run build       # Build TypeScript"));
    console.log(chalk.cyan("   npm test            # Run tests"));
    console.log(chalk.gray("\n💡 Edit src/tests/example.test.ts to add your tests!"));
}
async function runLocalIntrospection() {
    const spinner = ora("Running GraphQL introspection...").start();
    try {
        await runIntrospection();
        spinner.succeed("Schema introspection completed");
        const genSpinner = ora("Generating TypeScript client...").start();
        generateClients();
        genSpinner.succeed("Client generation completed");
        console.log(chalk.green.bold("\n✅ Initialization completed!"));
        console.log(chalk.gray("You can now build and run your tests."));
    }
    catch (error) {
        spinner.fail("Introspection failed");
        console.error(chalk.red("Error:"), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
async function runTests(pattern) {
    const spinner = ora("Loading tests...").start();
    try {
        // Load tests from dist directory
        const testsDir = path.resolve(process.cwd(), "dist/tests");
        if (!existsSync(testsDir)) {
            spinner.fail("Tests directory not found");
            console.log(chalk.yellow('💡 Run "npm run build" first to compile your tests.'));
            process.exit(1);
        }
        const { readdirSync } = await import("fs");
        const files = readdirSync(testsDir).filter((f) => f.endsWith(".js"));
        for (const f of files) {
            await import(path.join(testsDir, f));
        }
        spinner.succeed(`Loaded ${files.length} test file(s)`);
        await run({ pattern });
    }
    catch (error) {
        spinner.fail("Test execution failed");
        console.error(chalk.red("Error:"), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    try {
        switch (command) {
            case "create":
            case "init":
                if (args.length > 1 || !existsSync("integration-test.config.json")) {
                    // Global init: create new project
                    const projectName = args[1];
                    await initProject(projectName);
                }
                else {
                    // Local init: introspection in existing project
                    await runLocalIntrospection();
                }
                break;
            case "run":
                const patternArg = args.find((arg) => arg.startsWith("--pattern="));
                const pattern = patternArg?.split("=")[1];
                await runTests(pattern);
                break;
            case "print-config":
                try {
                    const config = loadConfig();
                    console.log(JSON.stringify(config, null, 2));
                }
                catch (error) {
                    console.error(chalk.red("Error loading config:"), error instanceof Error ? error.message : error);
                    process.exit(1);
                }
                break;
            case "--help":
            case "-h":
            case "help":
                console.log(chalk.blue.bold("\nBEST - GraphQL Integration Testing Framework\n"));
                console.log(chalk.white("Commands:\n"));
                console.log(chalk.cyan("  init [project-name]     ") +
                    chalk.gray("Create new project or run introspection"));
                console.log(chalk.cyan("  run [--pattern=text]    ") +
                    chalk.gray("Run integration tests"));
                console.log(chalk.cyan("  print-config            ") +
                    chalk.gray("Display current configuration"));
                console.log(chalk.cyan("  --help, -h              ") +
                    chalk.gray("Show this help message"));
                console.log(chalk.white("\nExamples:\n"));
                console.log(chalk.gray("  best init my-api-tests  ") +
                    chalk.dim("# Create new project"));
                console.log(chalk.gray("  best init               ") +
                    chalk.dim("# Run introspection in existing project"));
                console.log(chalk.gray("  best run                ") +
                    chalk.dim("# Run all tests"));
                console.log(chalk.gray("  best run --pattern=user ") +
                    chalk.dim('# Run tests matching "user"'));
                break;
            case "--version":
            case "-v":
                const packageJsonPath = path.join(__dirname, "..", "package.json");
                const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
                console.log(`best v${packageJson.version}`);
                break;
            default:
                if (!command) {
                    console.log(chalk.yellow("No command provided."));
                }
                else {
                    console.log(chalk.red(`Unknown command: ${command}`));
                }
                console.log(chalk.gray('Run "best --help" for usage information.'));
                process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk.red("Fatal error:"), error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=cli.js.map