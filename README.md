# BEST - GraphQL Integration Testing Framework

Eine professionelle GraphQL Integration Testing Framework mit TypeScript-Unterstützung.

## ⚡ Schnellstart

### Option 1: In bestehendes Projekt integrieren (Empfohlen)

```bash
# 1. Bibliothek installieren
npm install --save-dev github:Cyber-Luke/best-api-testing

# 2. Automatisches Setup ausführen
node ./node_modules/best/dist/setup-integration.js

# 3. Konfiguration anpassen (integration-test.config.json)
# 4. GraphQL Schema laden
npm run integration-tests:init

# 5. Tests ausführen
npm run integration-tests:full
```

### Option 2: Neues Projekt erstellen

```bash
# Neues Projekt erstellen
node ./node_modules/best/dist/cli.js init my-api-tests
cd my-api-tests
npm install
npm run init
npm test
```

## � Häufige Probleme lösen

### "best command not found"

Das ist normal! Verwenden Sie den vollständigen Pfad:

```bash
# Anstatt: best init
# Verwenden Sie:
node ./node_modules/best/dist/cli.js init

# Anstatt: npx best init
# Verwenden Sie:
node ./node_modules/best/dist/cli.js init
```

### Integration in package.json

Fügen Sie diese Scripts zu Ihrer `package.json` hinzu:

```json
{
  "scripts": {
    "integration-tests": "node ./node_modules/best/dist/cli.js run",
    "integration-tests:init": "node ./node_modules/best/dist/cli.js init",
    "integration-tests:build": "tsc -p integration-tests.tsconfig.json",
    "integration-tests:full": "npm run integration-tests:build && npm run integration-tests"
  }
}
```

Dann können Sie verwenden:

```bash
npm run integration-tests        # Tests ausführen
npm run integration-tests:init   # Schema laden
npm run integration-tests:full   # Build + Tests
```

- Create a new project directory
- Guide you through configuration setup (GraphQL endpoint, authentication, etc.)

## 📁 Projektstruktur nach Integration

```
your-project/
├── integration-tests/
│   ├── tests/
│   │   └── example.test.ts       # Ihre Tests
│   ├── graphql/                  # Auto-generiert
│   │   ├── index.ts
│   │   ├── types/
│   │   └── queries/
│   └── README.md
├── integration-test.config.json  # GraphQL Konfiguration
├── integration-tests.tsconfig.json
└── package.json                  # Mit neuen Scripts
```

## ✍️ Tests schreiben

```typescript
import { Test } from "best/dist/framework/decorators.js";
import { queries, types } from "../graphql/index.js";

export class MyAPITests {
  @Test
  static async getUserTest() {
    return {
      execute: async () => {
        const users = await queries.getAllUsers();
        return { users };
      },
      effects: [
        {
          name: "users-array",
          validate: (ctx) => Array.isArray(ctx.users),
          onFailureMessage: "Users should be an array",
        },
        {
          name: "users-not-empty",
          validate: (ctx) => ctx.users.length > 0,
          onFailureMessage: "Should have at least one user",
        },
      ],
      cleanup: async (ctx) => {
        console.log("Test completed");
      },
    };
  }
}
```

## 🔧 Konfiguration

Bearbeiten Sie `integration-test.config.json`:

```json
{
  "endpoint": "http://localhost:4000/graphql",
  "auth": {
    "type": "none" // oder "basic" oder "bearer"
  },
  "headers": {
    "X-API-Key": "your-key" // Optional
  },
  "schemaFile": "integration-tests/schema.json",
  "generatedDir": "integration-tests/graphql"
}
```

### Authentifizierung

**Bearer Token:**

```json
{
  "auth": {
    "type": "bearer",
    "token": "your-jwt-token"
  }
}
```

**Basic Auth:**

```json
{
  "auth": {
    "type": "basic",
    "username": "user",
    "password": "pass"
  }
}
```

## 🔍 CLI-Befehle

```bash
# Hilfe anzeigen
node ./node_modules/best/dist/cli.js --help

# Neues Projekt oder Schema laden
node ./node_modules/best/dist/cli.js init [project-name]

# Tests ausführen
node ./node_modules/best/dist/cli.js run

# Bestimmte Tests ausführen
node ./node_modules/best/dist/cli.js run --pattern=user

# Konfiguration anzeigen
node ./node_modules/best/dist/cli.js print-config

# Version anzeigen
node ./node_modules/best/dist/cli.js --version
```

## 🚀 Vollständiger Workflow

1. **Installation:**

   ```bash
   npm install --save-dev github:Cyber-Luke/best-api-testing
   ```

2. **Setup (automatisch):**

   ```bash
   node ./node_modules/best/dist/setup-integration.js
   ```

3. **Konfiguration anpassen:**
   Bearbeiten Sie `integration-test.config.json`

4. **Schema laden:**

   ```bash
   npm run integration-tests:init
   ```

5. **Tests schreiben:**
   Erstellen Sie `.test.ts` Dateien in `integration-tests/tests/`

6. **Tests ausführen:**
   ```bash
   npm run integration-tests:full
   ```

## 📚 Weitere Dokumentation

- [SETUP.md](./SETUP.md) - Detaillierte Setup-Anleitung
- [USAGE.md](./USAGE.md) - Verwendungsanleitung und Fehlerbehebung

## 🤝 Support

Bei Problemen:

1. Prüfen Sie [USAGE.md](./USAGE.md) für häufige Probleme
2. Verwenden Sie immer den vollständigen Pfad: `node ./node_modules/best/dist/cli.js`
3. Stellen Sie sicher, dass TypeScript kompiliert wurde: `npm run integration-tests:build`

## Features

- 🚀 TypeScript-basiert
- 🔍 Automatische GraphQL Schema-Introspection
- 🎯 Dekorator-basierte Test-Definition
- ✅ Eingebaute Validierung und Effects
- 🧹 Cleanup-Hooks
- 🔐 Authentifizierung (Bearer, Basic, Custom Headers)
- 📊 Detailliertes Test-Reporting
- 🔄 Pattern-basierte Test-Filterung

  ## Features

- 🚀 TypeScript-basiert
- 🔍 Automatische GraphQL Schema-Introspection
- 🎯 Dekorator-basierte Test-Definition
- ✅ Eingebaute Validierung und Effects
- 🧹 Cleanup-Hooks
- 🔐 Authentifizierung (Bearer, Basic, Custom Headers)
- 📊 Detailliertes Test-Reporting
- 🔄 Pattern-basierte Test-Filterung

## License

MIT License - siehe [LICENSE](LICENSE) für Details.

````

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
````

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
