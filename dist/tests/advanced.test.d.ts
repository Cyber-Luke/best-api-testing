import { types } from '../graphql/index.js';
export declare class AdvancedIntegrationTests {
    static crossServiceDataConsistency(): {
        execute: () => Promise<{
            pizzas: types.Pizza[];
            orders: types.Order[];
        }>;
        effects: {
            name: string;
            validate: (ctx: {
                pizzas: types.Pizza[];
                orders: types.Order[];
            }) => boolean;
            onFailureMessage: string;
        }[];
    };
    static authenticatedDataAccess(): {
        token: string;
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
}
