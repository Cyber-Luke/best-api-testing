import { Test } from "../framework/decorators.js";
import { queries, types } from "../graphql/index.js";

export class GraphQLAPITests {
  @Test
  static queryAllPizzas() {
    return {
      execute: async () => {
        const data = await queries.pizzas();
        return { pizzas: data };
      },
      effects: [
        {
          name: "pizzas-is-array",
          validate: (ctx: { pizzas: types.Pizza[] }) =>
            Array.isArray(ctx.pizzas),
          onFailureMessage: "Expected pizzas to be an array",
        },
        {
          name: "pizzas-not-empty",
          validate: (ctx: { pizzas: types.Pizza[] }) => ctx.pizzas.length > 0,
          onFailureMessage: "Expected at least one pizza in response",
        },
        {
          name: "pizza-has-valid-structure",
          validate: (ctx: { pizzas: types.Pizza[] }) => {
            if (ctx.pizzas.length === 0) return true;
            const first = ctx.pizzas[0];
            return (
              typeof first.id === "string" &&
              typeof first.size === "string" &&
              typeof first.price === "number"
            );
          },
          onFailureMessage:
            "Pizza objects should have correct types for id, size, and price",
        },
      ],
    };
  }

  @Test
  static queryAllOrders() {
    return {
      execute: async () => {
        const data = await queries.orders();
        return { orders: data };
      },
      effects: [
        {
          name: "orders-is-array",
          validate: (ctx: { orders: types.Order[] }) =>
            Array.isArray(ctx.orders),
          onFailureMessage: "Expected orders to be an array",
        },
      ],
    };
  }
}
