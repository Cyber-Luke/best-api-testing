# Integration Tests

GraphQL Integration Tests using BEST Framework

## Setup

1. Install BEST library:
   ```bash
   npm install --save-dev github:Cyber-Luke/best-api-testing
   ```

2. Configure your GraphQL endpoint in `integration-test.config.json`

3. Initialize GraphQL client:
   ```bash
   npm run integration-tests:init
   ```

4. Build and run tests:
   ```bash
   npm run integration-tests:full
   ```

## Available Commands

- `npm run integration-tests` - Run tests only
- `npm run integration-tests:init` - Generate GraphQL client from schema
- `npm run integration-tests:build` - Build TypeScript
- `npm run integration-tests:full` - Build and run tests

## Writing Tests

See `integration-tests/tests/example.test.ts` for examples.

## Configuration

Edit `integration-test.config.json` to configure:
- GraphQL endpoint URL
- Authentication (none, basic auth, bearer token)
- Custom headers
- Schema and output paths
