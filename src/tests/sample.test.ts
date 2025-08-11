import { Test } from "../framework/decorators.js";

export class SampleTests {
  @Test
  static basicTest() {
    return {
      execute: () => {
        return { message: "Test executed" };
      },
      effects: [
        {
          name: "always-pass",
          validate: (ctx: { message: string }) =>
            ctx.message === "Test executed",
        },
      ],
    };
  }
}
