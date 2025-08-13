import "reflect-metadata";
import { TestRegistry, AuthStrategy } from "./registry.js";
import type { TestPlan } from "./types.js";

// Core generic decorator factory supporting both TS 5+ and legacy semantics
function makeDecorator(handler: (opts: { name: string; fn: any }) => void) {
  function dec(value: any, context: ClassMethodDecoratorContext): any;
  function dec(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): any;
  function dec(...all: any[]): any {
    if (all.length === 2 && isNewContext(all[1])) {
      const [value, context] = all as [any, ClassMethodDecoratorContext];
      handler({ name: String(context.name), fn: value });
      return value;
    }
    if (all.length === 3) {
      const [target, propertyKey, descriptor] = all as [
        any,
        string,
        PropertyDescriptor
      ];
      const fn = descriptor?.value || (target as any)[propertyKey];
      handler({ name: propertyKey, fn });
    }
  }
  return dec as any;
}

export const Test = makeDecorator(({ name, fn }) => {
  TestRegistry.register({ name, auth: false, fn });
});

// Advanced AuthenticatedTest with dynamic token resolution
export interface AuthenticatedOptions {
  getToken?: () => Promise<string> | string; // dynamic token fetcher
  token?: string; // static token
  strategy?: AuthStrategy; // allow overriding strategy entirely
  description?: string;
  tags?: string[];
}

export function AuthenticatedTest(options: AuthenticatedOptions = {}) {
  return makeDecorator(({ name, fn }) => {
    TestRegistry.register({
      name,
      auth: true,
      fn: async () => {
        // Wrap original plan to inject token into context if provided
        const planOr = await fn();
        if (!planOr || typeof planOr !== "object" || !("execute" in planOr)) {
          return planOr as TestPlan;
        }
        const plan = planOr as TestPlan<any> & {
          headers?: Record<string, string>;
        };
        const token =
          options.strategy?.type === "bearer"
            ? options.strategy.token || (await options.strategy.getToken?.())
            : options.token || (await options.getToken?.());
        const existingExecute = plan.execute;
        plan.execute = async () => {
          const ctx = await existingExecute();
          if (token) (ctx as any).authToken = token;
          return ctx;
        };
        return plan;
      },
      meta: {
        authStrategy:
          options.strategy ||
          ({
            type: "bearer",
            token: options.token,
            getToken: options.getToken,
          } as AuthStrategy),
        tags: options.tags,
        description: options.description,
      },
    });
  });
}

export interface CustomDecoratorOptions {
  name?: string; // optional explicit test name override
  authStrategy?: AuthStrategy;
  description?: string;
  tags?: string[];
  transformPlan?: (
    plan: TestPlan<any>
  ) => TestPlan<any> | Promise<TestPlan<any>>;
}

// Build a custom test decorator easily
export function createTestDecorator(opts: CustomDecoratorOptions = {}) {
  return makeDecorator(({ name, fn }) => {
    TestRegistry.register({
      name: opts.name || name,
      auth: opts.authStrategy ? true : false,
      fn: async () => {
        const planOr = await fn();
        if (!planOr || typeof planOr !== "object" || !("execute" in planOr)) {
          return planOr as TestPlan;
        }
        let plan = planOr as TestPlan<any>;
        if (opts.transformPlan) {
          plan = await opts.transformPlan(plan);
        }
        return plan;
      },
      meta: {
        authStrategy: opts.authStrategy,
        description: opts.description,
        tags: opts.tags,
      },
    });
  });
}

function isNewContext(obj: any): obj is ClassMethodDecoratorContext {
  return !!obj && typeof obj === "object" && obj.kind === "method";
}
