// AUTO-GENERATED - DO NOT EDIT
import { call } from '../utils.js';
export async function orders() {
    const q = `query orders { orders { id date time } }`;
    const r = await call(q, undefined);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.orders;
}
export async function order(vars) {
    const q = `query order($id: String!) { order(id: $id) { id date time } }`;
    const r = await call(q, vars);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.order;
}
export async function pizzas() {
    const q = `query pizzas { pizzas { id size price } }`;
    const r = await call(q, undefined);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.pizzas;
}
export async function pizza(vars) {
    const q = `query pizza($id: String!) { pizza(id: $id) { id size price } }`;
    const r = await call(q, vars);
    if (r.errors)
        throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data.pizza;
}
//# sourceMappingURL=index.js.map