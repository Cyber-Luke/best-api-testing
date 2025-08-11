import { readFileSync, existsSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export interface AuthConfigNone {
  type: 'none';
}
export interface AuthConfigBasic {
  type: 'basic';
  username: string;
  password: string;
}
export interface AuthConfigBearer {
  type: 'bearer';
  token: string;
}
export type AuthConfig = AuthConfigNone | AuthConfigBasic | AuthConfigBearer;

export interface FrameworkConfig {
  endpoint: string; // GraphQL endpoint
  auth: AuthConfig;
  headers?: Record<string, string>;
  schemaFile?: string; // stored introspection result
  generatedDir?: string; // where to put generated operations wrappers
}

const DEFAULT_CONFIG: FrameworkConfig = {
  endpoint: 'http://localhost:3000/graphql',
  auth: { type: 'none' },
  schemaFile: 'schema.json',
  generatedDir: 'src/graphql',
};

export function loadConfig(
  configPath = 'integration-test.config.json',
): FrameworkConfig {
  dotenv.config();
  const full = path.resolve(process.cwd(), configPath);
  if (!existsSync(full)) return DEFAULT_CONFIG;
  const file = readFileSync(full, 'utf-8');
  const user = JSON.parse(file) as Partial<FrameworkConfig>;
  return { ...DEFAULT_CONFIG, ...user };
}
