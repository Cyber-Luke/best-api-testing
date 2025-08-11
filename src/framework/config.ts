import { readFileSync, existsSync } from "fs";
import path from "path";
import dotenv from "dotenv";
import { TestConfig, AuthConfig } from "./types.js";

export interface AuthConfigNone {
  type: "none";
}
export interface AuthConfigBasic {
  type: "basic";
  username: string;
  password: string;
}
export interface AuthConfigBearer {
  type: "bearer";
  token: string;
}

// Keep legacy type alias for compatibility
export type FrameworkConfig = TestConfig;

const DEFAULT_CONFIG: TestConfig = {
  endpoint: "http://localhost:3000/graphql",
  auth: { type: "none" },
  headers: {},
  schemaFile: "schema.json",
  generatedDir: "src/graphql",
};

export function loadConfig(
  configPath = "integration-test.config.json"
): TestConfig {
  dotenv.config();
  const full = path.resolve(process.cwd(), configPath);
  if (!existsSync(full)) return DEFAULT_CONFIG;
  const file = readFileSync(full, "utf-8");
  const user = JSON.parse(file) as Partial<TestConfig>;
  return { ...DEFAULT_CONFIG, ...user };
}
