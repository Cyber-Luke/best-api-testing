import { Test } from "best-api-testing";

export class SampleTests {
  @Test
  static basicTest() {
    return {
      execute: () => ({ message: "Test executed" }),
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
