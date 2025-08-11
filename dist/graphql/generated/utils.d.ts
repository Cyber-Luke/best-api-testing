export type Variables = Record<string, any>;
export interface GQLResponse<T> {
    data?: T;
    errors?: {
        message: string;
    }[];
}
export declare function call<T>(query: string, variables?: Variables): Promise<GQLResponse<T>>;
