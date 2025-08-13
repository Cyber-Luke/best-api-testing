import { createTestDecorator } from "best-api-testing";

// Example decorator placed under api-integration-tests/decorators
// Adds duration + tag and could later be extended for logging
export const ExampleDecorator = createTestDecorator({
  tags: ["example", "timing"],
  description: "Adds execution duration to context.durationMs",
  transformPlan: (plan) => ({
    ...plan,
    execute: async () => {
      const start = Date.now();
      const ctx = await plan.execute();
      (ctx as any).durationMs = Date.now() - start;
      return ctx;
    },
  }),
});
