import { TestConfig } from "./types.js";
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
export type FrameworkConfig = TestConfig;
export declare function loadConfig(configPath?: string): TestConfig;
//# sourceMappingURL=config.d.ts.map