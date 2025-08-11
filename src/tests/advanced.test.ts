import { Test, AuthenticatedTest } from '../framework/decorators.js';
import { queries, types } from '../graphql/index.js';

export class AdvancedIntegrationTests {
  @Test
  static crossServiceDataConsistency() {
    return {
      execute: async () => {
        const allPizzas = await queries.pizzas();
        const allOrders = await queries.orders();

        return { pizzas: allPizzas, orders: allOrders };
      },
      effects: [
        {
          name: 'data-consistency',
          validate: (ctx: { pizzas: types.Pizza[]; orders: types.Order[] }) => {
            // Simple validation - just check that we have both data sets
            return ctx.pizzas.length > 0 && ctx.orders.length > 0;
          },
          onFailureMessage: 'Should have both pizzas and orders data',
        },
      ],
    };
  }

  @AuthenticatedTest
  static authenticatedDataAccess() {
    return {
      token: 'test-admin-token',
      execute: async () => {
        const data = await queries.pizzas();
        return { pizzas: data };
      },
      effects: [
        {
          name: 'authenticated-access',
          validate: (ctx: { pizzas: types.Pizza[] }) =>
            Array.isArray(ctx.pizzas),
          onFailureMessage: 'Failed to access data with authentication',
        },
      ],
    };
  }
}
