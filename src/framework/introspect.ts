import fetch from "node-fetch";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { loadConfig } from "./config.js";

const INTROSPECTION_QUERY = `query IntrospectionQuery {\n  __schema {\n    queryType { name }\n    mutationType { name }\n    subscriptionType { name }\n    types {\n      ...FullType\n    }\n    directives {\n      name\n      description\n      locations\n      args { ...InputValue }\n    }\n  }\n}\nfragment FullType on __Type {\n  kind\n  name\n  description\n  fields(includeDeprecated: true) {\n    name\n    description\n    args { ...InputValue }\n    type { ...TypeRef }\n    isDeprecated\n    deprecationReason\n  }\n  inputFields { ...InputValue }\n  interfaces { ...TypeRef }\n  enumValues(includeDeprecated: true) {\n    name\n    description\n    isDeprecated\n    deprecationReason\n  }\n  possibleTypes { ...TypeRef }\n}\nfragment InputValue on __InputValue {\n  name\n  description\n  type { ...TypeRef }\n  defaultValue\n}\nfragment TypeRef on __Type {\n  kind\n  name\n  ofType {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n      }\n    }\n  }\n}`;

function buildHeaders(config: any): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(config.headers || {}),
  };

  if (config.auth) {
    if (config.auth.type === "basic") {
      const encoded = Buffer.from(
        `${config.auth.username}:${config.auth.password}`
      ).toString("base64");
      headers.authorization = `Basic ${encoded}`;
    } else if (config.auth.type === "bearer") {
      headers.authorization = `Bearer ${config.auth.token}`;
    }
  }

  return headers;
}

export async function runIntrospection() {
  const cfg = loadConfig();

  const headers = buildHeaders(cfg);

  const res = await fetch(cfg.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: INTROSPECTION_QUERY }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Introspection failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { data: any; errors?: any[] };

  if (json.errors && json.errors.length > 0) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }

  // Ensure output directory exists
  const schemaPath = path.resolve(process.cwd(), cfg.schemaFile);
  mkdirSync(path.dirname(schemaPath), { recursive: true });

  writeFileSync(schemaPath, JSON.stringify(json.data, null, 2));
  return json.data;
}
