import 'reflect-metadata';
import { TestRegistry } from './registry.js';
export function Test(target, propertyKey, descriptor) {
    TestRegistry.register({
        name: propertyKey,
        auth: false,
        fn: descriptor.value,
    });
}
export function AuthenticatedTest(target, propertyKey, descriptor) {
    TestRegistry.register({
        name: propertyKey,
        auth: true,
        fn: descriptor.value,
    });
}
//# sourceMappingURL=decorators.js.map