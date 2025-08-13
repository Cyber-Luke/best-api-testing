import { TestFnReturn } from "./types.js";

export interface AuthStrategyBearer {
  type: "bearer";
  getToken?: () => Promise<string> | string;
  token?: string; // static token fallback
}
export interface AuthStrategyBasic {
  type: "basic";
  username?: string;
  password?: string;
}
export interface AuthStrategyCustom {
  type: "custom";
  getHeaders: () => Promise<Record<string, string>> | Record<string, string>;
}
export interface AuthStrategyNone {
  type: "none";
}
export type AuthStrategy =
  | AuthStrategyNone
  | AuthStrategyBearer
  | AuthStrategyBasic
  | AuthStrategyCustom;

export interface RegisteredTestMeta {
  authStrategy?: AuthStrategy;
  tags?: string[];
  description?: string;
}

export interface RegisteredTest {
  name: string;
  auth: boolean; // legacy simple flag
  fn: () => TestFnReturn;
  target?: any;
  steps: RegisteredStep[];
  meta?: RegisteredTestMeta;
}

export interface RegisteredStep {
  name: string;
  order: number;
  run: (context: Record<string, any>) => Promise<any> | any;
}

class _TestRegistry {
  tests: Map<string, RegisteredTest> = new Map();
  register(t: Omit<RegisteredTest, "steps"> & { meta?: RegisteredTestMeta }) {
    const existing = this.tests.get(t.name);
    if (existing) {
      existing.fn = t.fn;
      existing.auth = t.auth;
      existing.target = t.target;
      existing.meta = t.meta || existing.meta;
      return;
    }
    this.tests.set(t.name, { ...t, steps: [] });
  }
  addStep(testName: string, step: Omit<RegisteredStep, "order">) {
    const test = this.tests.get(testName) || {
      name: testName,
      auth: false,
      fn: async () => undefined,
      steps: [],
    };
    if (!this.tests.has(testName))
      this.tests.set(testName, test as RegisteredTest);
    const order = test.steps.length;
    test.steps.push({ ...step, order });
  }
  list() {
    return Array.from(this.tests.values());
  }

  clear() {
    this.tests.clear();
  }
}

export const TestRegistry = new _TestRegistry();
