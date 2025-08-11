import { types } from "../graphql/index.js";
export declare class GraphQLAPITests {
    static queryAllPizzas(): {
        execute: () => Promise<{
            pizzas: types.Pizza[];
        }>;
        effects: {
            name: string;
            validate: (ctx: {
                pizzas: types.Pizza[];
            }) => boolean;
            onFailureMessage: string;
        }[];
    };
    static queryAllOrders(): {
        execute: () => Promise<{
            orders: types.Order[];
        }>;
        effects: {
            name: string;
            validate: (ctx: {
                orders: types.Order[];
            }) => boolean;
            onFailureMessage: string;
        }[];
    };
}
