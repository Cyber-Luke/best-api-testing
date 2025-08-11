# Integration in Ihr Projekt

## Für Benutzer der BEST Bibliothek

Wenn Sie BEST in Ihr eigenes Projekt integrieren möchten, folgen Sie diesen Schritten:

### 1. Installation

```bash
# In Ihrem Projektverzeichnis:
npm install --save-dev github:Cyber-Luke/best-api-testing
```

### 2. package.json Scripts hinzufügen

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

### 3. Automatisches Setup (Empfohlen)

```bash
# Führt automatisch die Integration durch
node ./node_modules/best/dist/setup-integration.js
```

### 4. Manuelle Integration

Falls Sie die Integration manuell durchführen möchten:

#### a) Ordnerstruktur erstellen:

```bash
mkdir -p integration-tests/tests
```

#### b) Konfiguration erstellen (`integration-test.config.json`):

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

#### c) TypeScript Config (`integration-tests.tsconfig.json`):

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

### 5. Verwendung

```bash
# GraphQL Schema laden
npm run integration-tests:init

# Tests kompilieren und ausführen
npm run integration-tests:full

# Nur Tests ausführen (nach dem Build)
npm run integration-tests
```

### 6. Beispiel Test schreiben

Erstellen Sie `integration-tests/tests/example.test.ts`:

```typescript
import { Test } from "best/dist/framework/decorators.js";
import { queries, types } from "../graphql/index.js";

export class APITests {
  @Test
  static async healthCheck() {
    return {
      execute: async () => {
        // Ihr API Test hier
        return { status: "ok" };
      },
      effects: [
        {
          name: "api-available",
          validate: (ctx) => ctx.status === "ok",
          onFailureMessage: "API should be available",
        },
      ],
    };
  }
}
```

## Wichtiger Hinweis

**Verwenden Sie niemals direkt `best` oder `npx best`!**

Das funktioniert nur, wenn BEST global installiert ist. Für Development-Dependencies verwenden Sie immer:

```bash
# Korrekt:
node ./node_modules/best/dist/cli.js [COMMAND]

# Oder über npm scripts:
npm run integration-tests
```

## Häufige Probleme

### "best: command not found"

Das ist normal! Verwenden Sie den vollständigen Pfad oder npm scripts.

### "Cannot find module 'best'"

Stellen Sie sicher, dass Sie das richtige Import-Path verwenden:

```typescript
import { Test } from "best/dist/framework/decorators.js";
```

### "Module not found" bei Tests

Kompilieren Sie zuerst:

```bash
npm run integration-tests:build
```
