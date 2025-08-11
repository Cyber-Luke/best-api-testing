import fetch from "node-fetch";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { loadConfig } from "./config.js";
const INTROSPECTION_QUERY = `query IntrospectionQuery {\n  __schema {\n    queryType { name }\n    mutationType { name }\n    subscriptionType { name }\n    types {\n      ...FullType\n    }\n    directives {\n      name\n      description\n      locations\n      args { ...InputValue }\n    }\n  }\n}\nfragment FullType on __Type {\n  kind\n  name\n  description\n  fields(includeDeprecated: true) {\n    name\n    description\n    args { ...InputValue }\n    type { ...TypeRef }\n    isDeprecated\n    deprecationReason\n  }\n  inputFields { ...InputValue }\n  interfaces { ...TypeRef }\n  enumValues(includeDeprecated: true) {\n    name\n    description\n    isDeprecated\n    deprecationReason\n  }\n  possibleTypes { ...TypeRef }\n}\nfragment InputValue on __InputValue {\n  name\n  description\n  type { ...TypeRef }\n  defaultValue\n}\nfragment TypeRef on __Type {\n  kind\n  name\n  ofType {\n    kind\n    name\n    ofType {\n      kind\n      name\n      ofType {\n        kind\n        name\n      }\n    }\n  }\n}`;
function getAuthHeaders(auth) {
    if (auth.type === "basic" && auth.username && auth.password) {
        const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString("base64");
        return { Authorization: `Basic ${encoded}` };
    }
    if (auth.type === "bearer" && auth.token) {
        return { Authorization: `Bearer ${auth.token}` };
    }
    return {};
}
export async function runIntrospection() {
    const cfg = loadConfig();
    const headers = {
        "content-type": "application/json",
        ...getAuthHeaders(cfg.auth),
        ...cfg.headers,
    };
    const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: INTROSPECTION_QUERY }),
    });
    if (!res.ok) {
        let errorMessage = `Introspection failed with status ${res.status}`;
        try {
            const errorBody = await res.text();
            if (errorBody) {
                errorMessage += `: ${errorBody}`;
            }
        }
        catch {
            // Ignore error parsing
        }
        throw new Error(errorMessage);
    }
    const json = (await res.json());
    if (json.errors && json.errors.length > 0) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`);
    }
    // Ensure directory exists
    const schemaPath = path.resolve(process.cwd(), cfg.schemaFile);
    const dir = path.dirname(schemaPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(schemaPath, JSON.stringify(json.data, null, 2));
    return json.data;
}
//# sourceMappingURL=introspect.js.map