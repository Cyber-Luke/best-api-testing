// AUTO-GENERATED - DO NOT EDIT
import { call } from '../utils.js';
import { registerOperation, markUsed } from '../../../../../dist/framework/coverage.js';
// Register operation for coverage tracking
registerOperation('query:orders');
export async function orders() {
    // Mark operation as used
    markUsed('query:orders');
    const q = `query orders { orders { id date time } }`;
    const r = await call(q, undefined);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.orders;
}
// Register operation for coverage tracking
registerOperation('query:order');
export async function order(vars) {
    // Mark operation as used
    markUsed('query:order');
    const q = `query order($id: String!) { order(id: $id) { id date time } }`;
    const r = await call(q, vars);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.order;
}
// Register operation for coverage tracking
registerOperation('query:pizzas');
export async function pizzas() {
    // Mark operation as used
    markUsed('query:pizzas');
    const q = `query pizzas { pizzas { id size price } }`;
    const r = await call(q, undefined);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.pizzas;
}
// Register operation for coverage tracking
registerOperation('query:pizza');
export async function pizza(vars) {
    // Mark operation as used
    markUsed('query:pizza');
    const q = `query pizza($id: String!) { pizza(id: $id) { id size price } }`;
    const r = await call(q, vars);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.pizza;
}
