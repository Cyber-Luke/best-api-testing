import { readFileSync, existsSync } from "fs";
import path from "path";
import dotenv from "dotenv";
const DEFAULT_CONFIG = {
    endpoint: "http://localhost:3000/graphql",
    auth: { type: "none" },
    headers: {},
    schemaFile: "schema.json",
    generatedDir: "src/graphql",
};
export function loadConfig(configPath = "integration-test.config.json") {
    dotenv.config();
    const full = path.resolve(process.cwd(), configPath);
    if (!existsSync(full))
        return DEFAULT_CONFIG;
    const file = readFileSync(full, "utf-8");
    const user = JSON.parse(file);
    return { ...DEFAULT_CONFIG, ...user };
}
//# sourceMappingURL=config.js.map