export interface TestEffect<TContext = any> {
  name: string;
  validate: (ctx: TContext) => boolean | Promise<boolean>;
  onFailureMessage?: string | ((ctx: TContext) => string);
}

export interface TestPlan<TContext = any> {
  execute: () => Promise<TContext> | TContext; // main operation(s)
  effects?: TestEffect<TContext>[];
  cleanup?: (ctx: TContext) => Promise<void> | void;
  timeoutMs?: number;
}

export type TestFnReturn = void | TestPlan<any> | Promise<void | TestPlan<any>>;

export interface AuthConfig {
  type: "none" | "basic" | "bearer";
  username?: string;
  password?: string;
  token?: string;
}

export interface TestConfig {
  endpoint: string;
  auth: AuthConfig;
  headers: Record<string, string>;
  schemaFile: string;
  generatedDir: string;
}

export interface RunOptions {
  pattern?: string;
  watch?: boolean;
  timeout?: number;
}
