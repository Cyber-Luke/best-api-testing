// AUTO-GENERATED - DO NOT EDIT
import fetch from 'node-fetch';
import { loadConfig } from './../../dist/framework/config.js';

export type Variables = Record<string, any>;
export interface GQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function call<T>(
  query: string,
  variables?: Variables,
): Promise<GQLResponse<T>> {
  const cfg = loadConfig();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(cfg.headers || {}),
  };
  if (cfg.auth.type === 'basic')
    headers['authorization'] =
      'Basic ' +
      Buffer.from(cfg.auth.username + ':' + cfg.auth.password).toString(
        'base64',
      );
  if (cfg.auth.type === 'bearer')
    headers['authorization'] = 'Bearer ' + cfg.auth.token;
  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<GQLResponse<T>>;
}
