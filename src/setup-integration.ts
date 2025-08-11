#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup script for integrating BEST into existing projects
 */
async function setupIntegration() {
  const targetDir = process.cwd();
  const packageJsonPath = path.join(targetDir, "package.json");

  console.log(
    chalk.blue.bold(
      "\n🚀 Setting up BEST Integration Tests in existing project\n"
    )
  );

  // Check if package.json exists
  if (!existsSync(packageJsonPath)) {
    console.log(chalk.red("❌ No package.json found in current directory"));
    console.log(
      chalk.gray("This script should be run in the root of your project")
    );
    process.exit(1);
  }

  // Read existing package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  // Create integration-tests directory
  const integrationDir = path.join(targetDir, "integration-tests");
  const testsDir = path.join(integrationDir, "tests");
  const graphqlDir = path.join(integrationDir, "graphql");

  mkdirSync(testsDir, { recursive: true });
  mkdirSync(graphqlDir, { recursive: true });

  // Add scripts to package.json
  const scriptsToAdd = {
    "integration-tests": "node ./node_modules/best/dist/cli.js run",
    "integration-tests:init": "node ./node_modules/best/dist/cli.js init",
    "integration-tests:build": "tsc -p integration-tests.tsconfig.json",
    "integration-tests:full":
      "npm run integration-tests:build && npm run integration-tests",
  };

  packageJson.scripts = { ...packageJson.scripts, ...scriptsToAdd };

  // Add devDependencies
  const devDepsToAdd = {
    typescript: "^5.7.3",
    "@types/node": "^24.2.1",
  };

  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    ...devDepsToAdd,
  };

  // Write updated package.json
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Create TypeScript config for integration tests
  const integrationTsConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "node",
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      outDir: "./dist-integration-tests",
      rootDir: "./integration-tests",
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
    include: ["integration-tests/**/*"],
    exclude: ["node_modules", "dist", "dist-integration-tests"],
  };

  writeFileSync(
    path.join(targetDir, "integration-tests.tsconfig.json"),
    JSON.stringify(integrationTsConfig, null, 2)
  );

  // Create config file
  const defaultConfig = {
    endpoint: "http://localhost:4000/graphql",
    auth: {
      type: "none",
    },
    headers: {},
    schemaFile: "integration-tests/schema.json",
    generatedDir: "integration-tests/graphql",
  };

  writeFileSync(
    path.join(targetDir, "integration-test.config.json"),
    JSON.stringify(defaultConfig, null, 2)
  );

  // Create example test
  const exampleTest = `import { Test } from 'best/dist/framework/decorators.js';
import { queries, types } from './graphql/index.js';

export class IntegrationTests {
  @Test
  static async healthCheck() {
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
  static async exampleApiTest() {
    return {
      execute: async () => {
        // Example: Query your GraphQL endpoint
        // Uncomment and modify based on your schema:
        // const users = await queries.getAllUsers();
        // return { users };
        
        return { message: 'Replace with actual GraphQL queries' };
      },
      effects: [
        {
          name: 'api-responds',
          validate: (ctx) => ctx.message !== undefined,
          onFailureMessage: 'API should respond with data'
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

  // Create README for integration tests
  const readme = `# Integration Tests

GraphQL Integration Tests using BEST Framework

## Setup

1. Install BEST library:
   \`\`\`bash
   npm install --save-dev github:Cyber-Luke/best-api-testing
   \`\`\`

2. Configure your GraphQL endpoint in \`integration-test.config.json\`

3. Initialize GraphQL client:
   \`\`\`bash
   npm run integration-tests:init
   \`\`\`

4. Build and run tests:
   \`\`\`bash
   npm run integration-tests:full
   \`\`\`

## Available Commands

- \`npm run integration-tests\` - Run tests only
- \`npm run integration-tests:init\` - Generate GraphQL client from schema
- \`npm run integration-tests:build\` - Build TypeScript
- \`npm run integration-tests:full\` - Build and run tests

## Writing Tests

See \`integration-tests/tests/example.test.ts\` for examples.

## Configuration

Edit \`integration-test.config.json\` to configure:
- GraphQL endpoint URL
- Authentication (none, basic auth, bearer token)
- Custom headers
- Schema and output paths
`;

  writeFileSync(path.join(integrationDir, "README.md"), readme);

  console.log(chalk.green.bold("✅ Integration tests setup completed!\n"));
  console.log(chalk.white("📋 Next steps:\n"));
  console.log(
    chalk.cyan(
      "   1. npm install --save-dev github:Cyber-Luke/best-api-testing"
    )
  );
  console.log(
    chalk.cyan(
      "   2. Edit integration-test.config.json with your GraphQL endpoint"
    )
  );
  console.log(chalk.cyan("   3. npm run integration-tests:init"));
  console.log(chalk.cyan("   4. npm run integration-tests:full"));
  console.log(
    chalk.gray(
      "\n💡 Edit integration-tests/tests/example.test.ts to add your tests!"
    )
  );
}

setupIntegration().catch(console.error);
