import { TestFnReturn } from './types.js';
export interface RegisteredTest {
    name: string;
    auth: boolean;
    fn: () => TestFnReturn;
    target?: any;
    steps: RegisteredStep[];
}
export interface RegisteredStep {
    name: string;
    order: number;
    run: (context: Record<string, any>) => Promise<any> | any;
}
declare class _TestRegistry {
    tests: Map<string, RegisteredTest>;
    register(t: Omit<RegisteredTest, 'steps'>): void;
    addStep(testName: string, step: Omit<RegisteredStep, 'order'>): void;
    list(): RegisteredTest[];
}
export declare const TestRegistry: _TestRegistry;
export {};
//# sourceMappingURL=registry.d.ts.map