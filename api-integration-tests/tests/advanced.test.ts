import { Test, AuthenticatedTest } from "best-api-testing";
// NOTE: Stelle sicher, dass der GraphQL Client (queries/types) generiert wurde.
// Falls nicht vorhanden: `best generate` ausführen, damit `api-integration-tests/graphql` entsteht.
import { queries, types } from "../graphql/index.js"; // bleibt bestehen, wenn Codegen läuft

export class AdvancedIntegrationTests {
  @Test()
  static crossServiceDataConsistency() {
    return {
      execute: async () => {
        const allPizzas = await queries.pizzas();
        const allOrders = await queries.orders();
        return { pizzas: allPizzas, orders: allOrders };
      },
      effects: [
        {
          name: "data-consistency",
          validate: (ctx: { pizzas: types.Pizza[]; orders: types.Order[] }) =>
            ctx.pizzas.length > 0 && ctx.orders.length > 0,
          onFailureMessage: "Should have both pizzas and orders data",
        },
      ],
    };
  }

  @AuthenticatedTest({ token: "test-admin-token" })
  static authenticatedDataAccess() {
    return {
      execute: async () => {
        const data = await queries.pizzas();
        return { pizzas: data };
      },
      effects: [
        {
          name: "authenticated-access",
          validate: (ctx: { pizzas: types.Pizza[] }) =>
            Array.isArray(ctx.pizzas),
          onFailureMessage: "Failed to access data with authentication",
        },
      ],
    };
  }
}
