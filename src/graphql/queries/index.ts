// AUTO-GENERATED - DO NOT EDIT
import { call } from '../utils.js';
import type { Order, Pizza } from '../types/index.js';

export async function orders(): Promise<Order[]> {
  const q = `query orders { orders { id date time } }`;
  const r = await call<{ orders: Order[] }>(q, undefined);
  if (r.errors) throw new Error(r.errors.map((e) => e.message).join('; '));
  return r.data!.orders;
}

export async function order(vars: { id: string }): Promise<Order> {
  const q = `query order($id: String!) { order(id: $id) { id date time } }`;
  const r = await call<{ order: Order }>(q, vars);
  if (r.errors) throw new Error(r.errors.map((e) => e.message).join('; '));
  return r.data!.order;
}

export async function pizzas(): Promise<Pizza[]> {
  const q = `query pizzas { pizzas { id size price } }`;
  const r = await call<{ pizzas: Pizza[] }>(q, undefined);
  if (r.errors) throw new Error(r.errors.map((e) => e.message).join('; '));
  return r.data!.pizzas;
}

export async function pizza(vars: { id: string }): Promise<Pizza> {
  const q = `query pizza($id: String!) { pizza(id: $id) { id size price } }`;
  const r = await call<{ pizza: Pizza }>(q, vars);
  if (r.errors) throw new Error(r.errors.map((e) => e.message).join('; '));
  return r.data!.pizza;
}
