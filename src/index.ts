// Main exports for the BEST framework
export { Test, AuthenticatedTest } from "./framework/decorators.js";
export { TestRegistry } from "./framework/registry.js";
export { run } from "./framework/runner.js";
export { loadConfig } from "./framework/config.js";
export { runIntrospection } from "./framework/introspect.js";
export { generateClients } from "./framework/generate.js";

// Types
export type {
  TestPlan,
  TestEffect,
  TestConfig,
  AuthConfig,
} from "./framework/types.js";

// Version info
export const version = "1.0.0";
