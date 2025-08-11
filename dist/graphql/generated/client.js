import fetch from "node-fetch";
import { loadConfig } from "../../framework/config.js";
async function call(query, variables) {
    const cfg = loadConfig();
    const headers = { "content-type": "application/json", ...(cfg.headers || {}) };
    if (cfg.auth.type === "basic")
        headers["authorization"] = "Basic " + Buffer.from(cfg.auth.username + ":" + cfg.auth.password).toString("base64");
    if (cfg.auth.type === "bearer")
        headers["authorization"] = "Bearer " + cfg.auth.token;
    const res = await fetch(cfg.endpoint, { method: "POST", headers, body: JSON.stringify({ query, variables }) });
    return res.json();
}
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
//# sourceMappingURL=client.js.map