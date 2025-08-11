import 'reflect-metadata';
import { TestRegistry } from './registry.js';

export function Test(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  TestRegistry.register({
    name: propertyKey,
    auth: false,
    fn: descriptor.value,
  });
}

export function AuthenticatedTest(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  TestRegistry.register({
    name: propertyKey,
    auth: true,
    fn: descriptor.value,
  });
}
