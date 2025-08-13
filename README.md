# BEST - GraphQL Integration Testing Framework

> A professional, schema-driven integration testing framework for GraphQL APIs with TypeScript support, interactive setup, and declarative test syntax.

[![npm version](https://badge.fury.io/js/best.svg)](https://www.npmjs.com/package/best)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Interactive Setup** - Guided project initialization with configuration wizard
- 🔑 **Multiple Auth Methods** - Support for Bearer tokens, Basic auth, and custom headers
- 📝 **Type-Safe Client** - Auto-generated TypeScript client from GraphQL schema
- 🎯 **Declarative Tests** - Clean test syntax with decorators and effects validation
- 🛠️ **Professional CLI** - Feature-rich command-line interface with colored output
- 🔄 **Schema Introspection** - Automatic client generation from live GraphQL endpoints
- 🧹 **Cleanup Support** - Built-in test cleanup and resource management
- 📊 **Rich Reporting** - Detailed test results with timing and error reporting

## Installation

### As a development dependency (recommended):

```bash
npm install --save-dev best
```

### From GitHub (latest):

```bash
npm install --save-dev github:Cyber-Luke/best-api-testing
```

### Global installation:

```bash
npm install -g best
```

## Quick Start

### 1. Create a new integration test project

```bash
# Create a new project with interactive setup
npx best init my-api-tests

# Or use default name (api-integration-tests)
npx best init
```

This will:
- Create a new project directory
- Guide you through configuration setup (GraphQL endpoint, authentication, etc.)
- Generate the basic project structure
- Create example test files

### 2. Navigate to your project and install dependencies

```bash
cd my-api-tests
npm install
```

### 3. Generate GraphQL client and run tests

```bash
# Generate TypeScript client from your GraphQL schema
npm run init

# Build and run tests
npm run build
npm test
```

## Project Structure

After initialization, your project will have this structure:

```
my-api-tests/
├── package.json
├── tsconfig.json
├── integration-test.config.json    # GraphQL endpoint & auth config
├── README.md
├── src/
│   ├── graphql/                     # Auto-generated GraphQL client
│   │   ├── index.ts
│   │   ├── types/
│   │   ├── queries/
│   │   └── utils.ts
│   └── tests/                       # Your test files
│       └── example.test.ts
└── dist/                           # Compiled JavaScript (after build)
```

## Configuration

The `integration-test.config.json` file contains your GraphQL endpoint and authentication settings:

```json
{
  "endpoint": "https://api.example.com/graphql",
  "auth": {
    "type": "bearer",
    "token": "your-api-token"
  },
  "headers": {
    "x-api-version": "v1"
  },
  "schemaFile": "schema.json",
  "generatedDir": "src/graphql"
}
```

### Authentication Options

- **None**: `{ "type": "none" }`
- **Basic Auth**: `{ "type": "basic", "username": "user", "password": "pass" }`
- **Bearer Token**: `{ "type": "bearer", "token": "your-token" }`

## Writing Tests

Tests are written using TypeScript decorators and a declarative effects system:

```typescript
import { Test } from 'best/dist/framework/decorators.js';
import { queries, types } from '../graphql/index.js';

export class UserAPITests {
  @Test
  static async getUserById() {
    return {
      execute: async () => {
        const user = await queries.user({ id: "123" });
        return { user };
      },
      effects: [
        {
          name: 'user-exists',
          validate: (ctx) => ctx.user !== null,
          onFailureMessage: 'User should exist'
        },
        {
          name: 'user-has-email',
          validate: (ctx) => ctx.user.email.includes('@'),
          onFailureMessage: (ctx) => `Invalid email: ${ctx.user.email}`
        }
      ],
      cleanup: async (ctx) => {
        // Optional cleanup logic
        console.log(`🧹 Cleaned up user test for ${ctx.user.id}`);
      }
    };
  }

  @Test
  static async createAndDeleteUser() {
    return {
      execute: async () => {
        // Using mutations (auto-generated)
        const newUser = await queries.createUser({ 
          input: { name: "Test User", email: "test@example.com" } 
        });
        return { newUser };
      },
      effects: [
        {
          name: 'user-created',
          validate: (ctx) => ctx.newUser.id !== undefined,
          onFailureMessage: 'User creation should return an ID'
        }
      ],
      cleanup: async (ctx) => {
        // Clean up created user
        await queries.deleteUser({ id: ctx.newUser.id });
        console.log(`🧹 Deleted test user ${ctx.newUser.id}`);
      }
    };
  }
}
```

## CLI Commands

### Project Management

```bash
# Create new project with interactive setup
best init [project-name]

# Initialize GraphQL client in existing project
best init
```

### Running Tests

```bash
# Run all tests
best run

# Run tests matching a pattern
best run --pattern=user

# Show configuration
best print-config

# Show help
best --help

# Show version
best --version
```

### npm Scripts (in generated projects)

```bash
npm run init        # Generate GraphQL client
npm run build       # Compile TypeScript
npm test           # Run all tests
npm run test:watch # Run tests in watch mode (if configured)
```

## Test Decorators

### `@Test`
Standard test decorator for regular test methods.

### `@AuthenticatedTest` 
Test decorator that ensures authentication is configured before running.

## Advanced Usage

### Custom Headers

Add custom headers to all GraphQL requests:

```json
{
  "endpoint": "https://api.example.com/graphql",
  "headers": {
    "x-api-version": "v2",
    "x-client-name": "integration-tests"
  }
}
```

### Environment Variables

Use `.env` files for sensitive configuration:

```bash
# .env
GRAPHQL_ENDPOINT=https://staging-api.example.com/graphql
GRAPHQL_TOKEN=staging-token-123
```

```json
{
  "endpoint": "${GRAPHQL_ENDPOINT}",
  "auth": {
    "type": "bearer",
    "token": "${GRAPHQL_TOKEN}"
  }
}
```

### Complex Test Scenarios

```typescript
@Test
static async complexUserWorkflow() {
  return {
    execute: async () => {
      // Multi-step test scenario
      const users = await queries.users({ limit: 10 });
      const firstUser = users[0];
      const userPosts = await queries.userPosts({ userId: firstUser.id });
      
      return { users, firstUser, userPosts };
    },
    effects: [
      {
        name: 'users-returned',
        validate: (ctx) => ctx.users.length > 0,
        onFailureMessage: 'Should return at least one user'
      },
      {
        name: 'user-has-posts',
        validate: (ctx) => ctx.userPosts.length >= 0,
        onFailureMessage: 'Posts query should succeed (can be empty)'
      },
      {
        name: 'consistent-user-data',
        validate: (ctx) => ctx.firstUser.id !== undefined,
        onFailureMessage: 'User ID should be defined'
      }
    ]
  };
}
```

## Error Handling

The framework provides detailed error reporting:

```bash
Running 3 test(s)...

✔ getUserById (45ms)
✖ createUser (123ms): GraphQL error: User validation failed
✔ deleteUser (67ms)

2/3 passed

Failed tests:
  • createUser: GraphQL error: User validation failed
```

## TypeScript Configuration

The framework generates a TypeScript configuration optimized for GraphQL integration testing:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/Cyber-Luke/best-api-testing/wiki)
- 🐛 [Issue Tracker](https://github.com/Cyber-Luke/best-api-testing/issues)
- 💬 [Discussions](https://github.com/Cyber-Luke/best-api-testing/discussions)

---

Built with ❤️ for the GraphQL community
