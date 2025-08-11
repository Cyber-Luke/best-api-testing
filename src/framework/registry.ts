import { TestFnReturn } from './types.js';

export interface RegisteredTest {
  name: string;
  auth: boolean;
  fn: () => TestFnReturn;
  target?: any;
  steps: RegisteredStep[];
}

export interface RegisteredStep {
  name: string;
  order: number;
  run: (context: Record<string, any>) => Promise<any> | any;
}

class _TestRegistry {
  tests: Map<string, RegisteredTest> = new Map();
  register(t: Omit<RegisteredTest, 'steps'>) {
    const existing = this.tests.get(t.name);
    if (existing) {
      existing.fn = t.fn;
      existing.auth = t.auth;
      existing.target = t.target;
      return;
    }
    this.tests.set(t.name, { ...t, steps: [] });
  }
  addStep(testName: string, step: Omit<RegisteredStep, 'order'>) {
    const test = this.tests.get(testName) || {
      name: testName,
      auth: false,
      fn: async () => undefined,
      steps: [],
    };
    if (!this.tests.has(testName)) this.tests.set(testName, test);
    const order = test.steps.length;
    test.steps.push({ ...step, order });
  }
  list() {
    return Array.from(this.tests.values());
  }
}

export const TestRegistry = new _TestRegistry();
