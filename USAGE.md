# BEST Integration Tests - Verwendungsanleitung

## Die Fehler die Sie haben sind normal!

Das Problem liegt daran, dass das `best` CLI nicht direkt verfügbar ist, wenn Sie es als Development-Dependency installieren. Hier sind die Lösungen:

## Sofortige Lösung

### Option 1: Vollständiger Pfad verwenden

```bash
# Anstatt: best init my-api-tests
# Verwenden Sie:
node ./node_modules/best/dist/cli.js init my-api-tests

# Anstatt: npx best init
# Verwenden Sie:
npx --package github:Cyber-Luke/best-api-testing node ./node_modules/best/dist/cli.js init
```

### Option 2: Setup-Skript verwenden (Empfohlen)

```bash
npm install --save-dev github:Cyber-Luke/best-api-testing
npx --package github:Cyber-Luke/best-api-testing node ./node_modules/best/dist/setup-integration.js
```

## Integration in bestehende Projekte

### Automatische Integration

```bash
# In Ihrem Projektverzeichnis:
npm install --save-dev github:Cyber-Luke/best-api-testing

# Setup-Skript ausführen:
node ./node_modules/best/dist/setup-integration.js
```

Dies erstellt automatisch:

- `integration-tests/` Ordner
- `integration-test.config.json`
- `integration-tests.tsconfig.json`
- Beispiel-Tests
- npm scripts

### Manuelle Integration

1. **package.json erweitern:**

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

2. **Verwendung:**

```bash
# GraphQL Schema laden
npm run integration-tests:init

# Tests bauen und ausführen
npm run integration-tests:full

# Nur Tests ausführen
npm run integration-tests
```

## Typische Arbeitsweise

```bash
# 1. Bibliothek installieren
npm install --save-dev github:Cyber-Luke/best-api-testing

# 2. Setup ausführen
node ./node_modules/best/dist/setup-integration.js

# 3. Konfiguration anpassen (integration-test.config.json)
# Ihre GraphQL URL eintragen

# 4. Schema laden
npm run integration-tests:init

# 5. Tests schreiben (integration-tests/tests/)

# 6. Tests ausführen
npm run integration-tests:full
```

## Fehlerbehebung

### "best: command not found"

Das ist normal! Verwenden Sie:

```bash
node ./node_modules/best/dist/cli.js [COMMAND]
```

### "Cannot find module"

Stellen Sie sicher, dass Sie zuerst kompiliert haben:

```bash
npm run integration-tests:build
```

### "Permission denied"

```bash
chmod +x ./node_modules/best/dist/cli.js
```

## Beispiel-Integration

Hier ist ein komplettes Beispiel für ein bestehendes Projekt:

1. **Installation:**

```bash
npm install --save-dev github:Cyber-Luke/best-api-testing
```

2. **package.json ergänzen:**

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

3. **Ordnerstruktur erstellen:**

```
your-project/
├── integration-tests/
│   └── tests/
│       └── api.test.ts
├── integration-test.config.json
└── integration-tests.tsconfig.json
```

4. **Konfiguration (integration-test.config.json):**

```json
{
  "endpoint": "http://localhost:4000/graphql",
  "auth": { "type": "none" },
  "headers": {},
  "schemaFile": "integration-tests/schema.json",
  "generatedDir": "integration-tests/graphql"
}
```

5. **TypeScript Config (integration-tests.tsconfig.json):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist-integration-tests",
    "rootDir": "./integration-tests",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["integration-tests/**/*"]
}
```

6. **Erste Verwendung:**

```bash
npm run integration-tests:init  # Schema laden
npm run integration-tests:full  # Tests ausführen
```

Das war's! Jetzt können Sie mit `npm run integration-tests` Ihre Tests ausführen.
