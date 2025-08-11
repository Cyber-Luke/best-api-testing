var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Test, AuthenticatedTest } from '../framework/decorators.js';
import { queries } from '../graphql/index.js';
export class AdvancedIntegrationTests {
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
                    validate: (ctx) => {
                        return ctx.pizzas.length > 0 && ctx.orders.length > 0;
                    },
                    onFailureMessage: 'Should have both pizzas and orders data',
                },
            ],
        };
    }
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
                    validate: (ctx) => Array.isArray(ctx.pizzas),
                    onFailureMessage: 'Failed to access data with authentication',
                },
            ],
        };
    }
}
__decorate([
    Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdvancedIntegrationTests, "crossServiceDataConsistency", null);
__decorate([
    AuthenticatedTest,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdvancedIntegrationTests, "authenticatedDataAccess", null);
//# sourceMappingURL=advanced.test.js.map