# BEST - Setup Guide

## Installation

### Option 1: Neues Projekt erstellen

```bash
# Erstelle ein neues Integrations-Test-Projekt
npx github:Cyber-Luke/best-api-testing init my-api-tests
cd my-api-tests
npm install
npm run init
npm test
```

### Option 2: In bestehendes Projekt integrieren

```bash
# Im Root-Verzeichnis Ihres bestehenden Projekts:
npm install --save-dev github:Cyber-Luke/best-api-testing

# Setup-Skript ausführen (automatische Integration)
npx best-setup

# ODER manuelle Integration:
```

#### Manuelle Integration

1. **package.json erweitern:**

```json
{
  "scripts": {
    "integration-tests": "node ./node_modules/best/dist/cli.js run",
    "integration-tests:init": "node ./node_modules/best/dist/cli.js init",
    "integration-tests:build": "tsc -p integration-tests.tsconfig.json",
    "integration-tests:full": "npm run integration-tests:build && npm run integration-tests"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "@types/node": "^24.2.1"
  }
}
```

2. **Ordnerstruktur erstellen:**

```
your-project/
├── integration-tests/
│   ├── tests/
│   ├── graphql/           # wird automatisch generiert
│   └── README.md
├── integration-test.config.json
└── integration-tests.tsconfig.json
```

3. **Konfiguration (integration-test.config.json):**

```json
{
  "endpoint": "http://localhost:4000/graphql",
  "auth": {
    "type": "none"
  },
  "headers": {},
  "schemaFile": "integration-tests/schema.json",
  "generatedDir": "integration-tests/graphql"
}
```

4. **TypeScript Config (integration-tests.tsconfig.json):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist-integration-tests",
    "rootDir": "./integration-tests",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["integration-tests/**/*"],
  "exclude": ["node_modules", "dist", "dist-integration-tests"]
}
```

## Verwendung

### 1. Erstmalige Einrichtung

```bash
# GraphQL Schema introspektieren und Client generieren
npm run integration-tests:init
```

### 2. Tests ausführen

```bash
# Nur Tests ausführen (nach dem Build)
npm run integration-tests

# Build und Tests ausführen
npm run integration-tests:full
```

### 3. Test schreiben

Beispiel Test (`integration-tests/tests/example.test.ts`):

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
        // Optional cleanup
        console.log("Test completed");
      },
    };
  }
}
```

## Fehlerbehebung

### "best command not found"

```bash
# Nutzen Sie den vollen Pfad:
node ./node_modules/best/dist/cli.js --help

# Oder fügen Sie es zu package.json scripts hinzu
```

### "Module not found"

```bash
# Stellen Sie sicher, dass das Projekt gebaut wurde:
npm run integration-tests:build

# Oder prüfen Sie die TypeScript Konfiguration
```

### CLI-Befehle

```bash
# Hilfe anzeigen
node ./node_modules/best/dist/cli.js --help

# Version anzeigen
node ./node_modules/best/dist/cli.js --version

# Konfiguration anzeigen
node ./node_modules/best/dist/cli.js print-config

# Tests mit Pattern ausführen
node ./node_modules/best/dist/cli.js run --pattern=user
```

## Authentifizierung

### Basic Auth

```json
{
  "auth": {
    "type": "basic",
    "username": "your-username",
    "password": "your-password"
  }
}
```

### Bearer Token

```json
{
  "auth": {
    "type": "bearer",
    "token": "your-jwt-token"
  }
}
```

### Custom Headers

```json
{
  "headers": {
    "X-API-Key": "your-api-key",
    "Custom-Header": "value"
  }
}
```
