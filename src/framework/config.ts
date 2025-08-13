import { readFileSync, existsSync, writeFileSync, renameSync } from "fs";
import path from "path";
import dotenv from "dotenv";

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
export type AuthConfig = AuthConfigNone | AuthConfigBasic | AuthConfigBearer;

export interface CoverageConfig {
  enabled: boolean;
  failOnBelow: boolean;
  minPercentTotal?: number;
  minPercentQueries?: number;
  minPercentMutations?: number;
  reportFormats: ("table" | "json" | "summary")[];
}

export interface FrameworkConfig {
  endpoint: string;
  auth: AuthConfig;
  headers?: Record<string, string>;
  schemaFile: string;
  outputRoot: string;
  generatedDir: string;
  testDir: string;
  coverage: CoverageConfig;
}

const DEFAULT_CONFIG: FrameworkConfig = {
  endpoint: "http://localhost:3000/graphql",
  auth: { type: "none" },
  schemaFile: "api-integration-tests/schema.json",
  outputRoot: "api-integration-tests",
  generatedDir: "api-integration-tests/graphql",
  testDir: "api-integration-tests/tests",
  coverage: {
    enabled: true,
    failOnBelow: false,
    minPercentTotal: 50,
    minPercentQueries: 40,
    minPercentMutations: 30,
    reportFormats: ["table", "summary"],
  },
};

function migrateFromLegacyConfig(): FrameworkConfig | null {
  const legacyPath = path.resolve(
    process.cwd(),
    "integration-test.config.json"
  );
  const newPath = path.resolve(process.cwd(), "best.config.json");

  if (existsSync(legacyPath) && !existsSync(newPath)) {
    console.log(
      "🔄 Migrating from integration-test.config.json to best.config.json..."
    );

    const legacyContent = readFileSync(legacyPath, "utf-8");
    const legacyConfig = JSON.parse(legacyContent);

    // Migrate to new structure
    const migratedConfig: FrameworkConfig = {
      ...DEFAULT_CONFIG,
      endpoint: legacyConfig.endpoint || DEFAULT_CONFIG.endpoint,
      auth: legacyConfig.auth || DEFAULT_CONFIG.auth,
      headers: legacyConfig.headers,
    };

    // Write new config
    writeFileSync(newPath, JSON.stringify(migratedConfig, null, 2));

    // Keep old file as backup
    renameSync(legacyPath, legacyPath + ".backup");

    console.log(
      "✅ Migration completed! Old config saved as integration-test.config.json.backup"
    );

    return migratedConfig;
  }

  return null;
}

export function loadConfig(configPath = "best.config.json"): FrameworkConfig {
  dotenv.config();

  // Try migration first
  const migrated = migrateFromLegacyConfig();
  if (migrated) {
    return migrated;
  }

  const full = path.resolve(process.cwd(), configPath);
  if (!existsSync(full)) return DEFAULT_CONFIG;

  const file = readFileSync(full, "utf-8");
  const user = JSON.parse(file) as Partial<FrameworkConfig>;

  // Merge with defaults, ensuring all required fields are present
  return {
    endpoint: user.endpoint || DEFAULT_CONFIG.endpoint,
    auth: user.auth || DEFAULT_CONFIG.auth,
    headers: user.headers,
    schemaFile: user.schemaFile || DEFAULT_CONFIG.schemaFile,
    outputRoot: user.outputRoot || DEFAULT_CONFIG.outputRoot,
    generatedDir: user.generatedDir || DEFAULT_CONFIG.generatedDir,
    testDir: user.testDir || DEFAULT_CONFIG.testDir,
    coverage: {
      ...DEFAULT_CONFIG.coverage,
      ...user.coverage,
    },
  };
}

export function saveConfig(
  config: FrameworkConfig,
  configPath = "best.config.json"
): void {
  const full = path.resolve(process.cwd(), configPath);
  writeFileSync(full, JSON.stringify(config, null, 2));
}
