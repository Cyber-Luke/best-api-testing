export type Variables = Record<string, any>;
export interface GQLResponse<T> {
    data?: T;
    errors?: {
        message: string;
    }[];
}
export interface Order {
    id: string;
    date: string;
    time: string;
    details: OrderDetail[];
}
export interface OrderDetail {
    pizza: Pizza;
    quantity: number;
}
export interface Pizza {
    id: string;
    type: PizzaType;
    size: string;
    price: number;
}
export interface PizzaType {
    name: string;
    category: string;
    ingredients: string;
}
export declare function orders(): Promise<Order[]>;
export declare function order(vars: {
    id: string;
}): Promise<Order>;
export declare function pizzas(): Promise<Pizza[]>;
export declare function pizza(vars: {
    id: string;
}): Promise<Pizza>;
