import type { Order, Pizza } from '../types/index.js';
export declare function orders(): Promise<Order[]>;
export declare function order(vars: {
    id: string;
}): Promise<Order>;
export declare function pizzas(): Promise<Pizza[]>;
export declare function pizza(vars: {
    id: string;
}): Promise<Pizza>;
