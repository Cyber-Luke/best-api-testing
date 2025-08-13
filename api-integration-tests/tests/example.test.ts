import { Test } from "best-api-testing";

export class Example {
  @Test
  static basic() {
    return {
      execute: () => ({ ok: true }),
      effects: [{ name: "ok-flag", validate: (c: any) => c.ok === true }],
    };
  }
}
