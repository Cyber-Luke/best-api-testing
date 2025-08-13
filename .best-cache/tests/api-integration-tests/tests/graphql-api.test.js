var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Test } from "best-api-testing";
import { queries } from "../graphql/index.js";
export class GraphQLAPITests {
    static queryAllPizzas() {
        return {
            execute: async () => {
                const pizzas = await queries.pizzas();
                return { pizzas };
            },
            effects: [
                {
                    name: "pizzas-is-array",
                    validate: (ctx) => Array.isArray(ctx.pizzas),
                    onFailureMessage: "Expected pizzas to be an array",
                },
                {
                    name: "pizzas-not-empty",
                    validate: (ctx) => ctx.pizzas.length > 0,
                    onFailureMessage: "Expected at least one pizza in response",
                },
                {
                    name: "pizza-has-valid-structure",
                    validate: (ctx) => {
                        if (ctx.pizzas.length === 0)
                            return true; // handled by previous effect
                        const first = ctx.pizzas[0];
                        return (typeof first.id === "string" &&
                            typeof first.size === "string" &&
                            typeof first.price === "number");
                    },
                    onFailureMessage: "Pizza objects should have correct types for id, size, and price",
                },
            ],
        };
    }
    static queryAllOrders() {
        return {
            execute: async () => {
                const orders = await queries.orders();
                return { orders };
            },
            effects: [
                {
                    name: "orders-is-array",
                    validate: (ctx) => Array.isArray(ctx.orders),
                    onFailureMessage: "Expected orders to be an array",
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
], GraphQLAPITests, "queryAllPizzas", null);
__decorate([
    Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GraphQLAPITests, "queryAllOrders", null);
