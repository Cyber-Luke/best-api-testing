# BEST Framework - Setup Guide

## For Framework Developers

### Publishing to npm

1. **Build the framework:**

   ```bash
   npm run build
   ```

2. **Test locally:**

   ```bash
   # Test CLI
   node dist/cli.js --help

   # Test project creation
   mkdir test-project && cd test-project
   node ../dist/cli.js init my-test
   ```

3. **Publish to npm:**
   ```bash
   npm publish
   # or for scoped packages:
   npm publish --access public
   ```

### Installing from GitHub

Users can install directly from GitHub:

```bash
npm install --save-dev github:Cyber-Luke/best-api-testing
```

## For Framework Users

### Option 1: npm install (when published)

```bash
npm install --save-dev best
npx best init my-api-tests
```

### Option 2: GitHub install

```bash
npm install --save-dev github:Cyber-Luke/best-api-testing
npx best init my-api-tests
```

### Option 3: Global install

```bash
npm install -g best
best init my-api-tests
```

## Complete Workflow Example

1. **Install the framework:**

   ```bash
   npm install --save-dev best
   ```

2. **Create a new integration test project:**

   ```bash
   npx best init my-api-tests
   cd my-api-tests
   ```

3. **Follow the interactive setup:**

   - Enter your GraphQL endpoint URL
   - Choose authentication method
   - Add custom headers if needed

4. **Install dependencies:**

   ```bash
   npm install
   ```

5. **Generate GraphQL client:**

   ```bash
   npm run init
   ```

6. **Build and run tests:**
   ```bash
   npm run build
   npm test
   ```

## Project Structure Created

```
my-api-tests/
├── package.json                     # Project config with BEST as dependency
├── tsconfig.json                    # TypeScript configuration
├── integration-test.config.json    # GraphQL endpoint & auth settings
├── README.md                        # Project-specific README
├── src/
│   ├── graphql/                     # Auto-generated (after npm run init)
│   │   ├── index.ts
│   │   ├── types/index.ts
│   │   ├── queries/index.ts
│   │   └── utils.ts
│   └── tests/                       # Your test files
│       └── example.test.ts          # Example test file
└── dist/                           # Compiled output (after npm run build)
```

## Key Commands

- `best init [project-name]` - Create new project or run introspection
- `best run` - Run all tests
- `best run --pattern=text` - Run specific tests
- `best print-config` - Show current configuration
- `best --help` - Show help
- `best --version` - Show version

## Authentication Examples

### No Authentication

```json
{
  "endpoint": "http://localhost:4000/graphql",
  "auth": { "type": "none" }
}
```

### Bearer Token

```json
{
  "endpoint": "https://api.example.com/graphql",
  "auth": {
    "type": "bearer",
    "token": "your-api-token"
  }
}
```

### Basic Auth

```json
{
  "endpoint": "https://api.example.com/graphql",
  "auth": {
    "type": "basic",
    "username": "user",
    "password": "pass"
  }
}
```

### With Custom Headers

```json
{
  "endpoint": "https://api.example.com/graphql",
  "auth": { "type": "none" },
  "headers": {
    "x-api-version": "v1",
    "x-client": "integration-tests"
  }
}
```
