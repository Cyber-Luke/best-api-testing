import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { loadConfig } from "./config.js";
function unwrap(typ) {
    if (!typ)
        return "any";
    if (typ.kind === "NON_NULL")
        return unwrap(typ.ofType);
    if (typ.kind === "LIST")
        return `${unwrap(typ.ofType)}[]`;
    // Map GraphQL scalars to TypeScript types
    const typeName = typ.name || "any";
    switch (typeName) {
        case "ID":
            return "string";
        case "String":
            return "string";
        case "Int":
            return "number";
        case "Float":
            return "number";
        case "Boolean":
            return "boolean";
        default:
            return typeName;
    }
}
function getGraphQLTypeName(typ) {
    if (!typ)
        return "String";
    if (typ.kind === "NON_NULL")
        return getGraphQLTypeName(typ.ofType) + "!";
    if (typ.kind === "LIST")
        return `[${getGraphQLTypeName(typ.ofType)}]`;
    return typ.name || "String";
}
function buildSelectionSet(fieldType, types, depth = 0) {
    if (depth > 2)
        return ""; // prevent infinite recursion
    const baseType = unwrapToBaseType(fieldType);
    if (!baseType?.name)
        return "";
    const typeObj = types.find((t) => t.name === baseType.name);
    if (!typeObj || !typeObj.fields)
        return "";
    const scalarFields = typeObj.fields
        .filter((f) => {
        const fType = unwrapToBaseType(f.type);
        return (fType &&
            ["String", "Int", "Float", "Boolean", "ID"].includes(fType.name));
    })
        .map((f) => f.name);
    if (scalarFields.length === 0)
        return "";
    return ` { ${scalarFields.join(" ")} }`;
}
function unwrapToBaseType(typ) {
    if (!typ)
        return null;
    if (typ.kind === "NON_NULL" || typ.kind === "LIST")
        return unwrapToBaseType(typ.ofType);
    return typ;
}
export function generateClients() {
    const cfg = loadConfig();
    const schemaPath = path.resolve(process.cwd(), cfg.schemaFile);
    const raw = readFileSync(schemaPath, "utf-8");
    const data = JSON.parse(raw);
    const types = data.__schema.types;
    const queryTypeName = data.__schema.queryType?.name;
    const mutationTypeName = data.__schema.mutationType?.name;
    const queryType = types.find((t) => t.name === queryTypeName);
    const mutationType = types.find((t) => t.name === mutationTypeName);
    const baseDir = path.resolve(process.cwd(), cfg.generatedDir);
    // Create directory structure
    const dirs = ["types", "queries", "mutations"];
    dirs.forEach((dir) => {
        const dirPath = path.join(baseDir, dir);
        if (!existsSync(dirPath))
            mkdirSync(dirPath, { recursive: true });
    });
    // Generate types
    generateTypes(types, baseDir);
    // Generate shared utilities
    generateUtils(baseDir);
    // Generate queries
    if (queryType) {
        generateOperations("query", queryType, types, baseDir, "queries");
    }
    // Generate mutations
    if (mutationType) {
        generateOperations("mutation", mutationType, types, baseDir, "mutations");
    }
    // Generate main index file
    generateIndexFile(baseDir, queryType, mutationType);
}
function generateTypes(types, baseDir) {
    const complexTypes = types.filter((t) => t.kind === "OBJECT" &&
        ![
            "Query",
            "Mutation",
            "__Schema",
            "__Type",
            "__Field",
            "__InputValue",
            "__EnumValue",
            "__Directive",
        ].includes(t.name));
    const lines = [];
    lines.push("// AUTO-GENERATED - DO NOT EDIT");
    lines.push("");
    complexTypes.forEach((type) => {
        if (type.fields) {
            lines.push(`export interface ${type.name} {`);
            type.fields.forEach((field) => {
                const fieldType = unwrap(field.type);
                lines.push(`  ${field.name}: ${fieldType};`);
            });
            lines.push("}");
            lines.push("");
        }
    });
    writeFileSync(path.join(baseDir, "types", "index.ts"), lines.join("\n"));
}
function generateUtils(baseDir) {
    const lines = [];
    lines.push("// AUTO-GENERATED - DO NOT EDIT");
    lines.push("import fetch from 'node-fetch';");
    lines.push("import { loadConfig } from '../framework/config.js';");
    lines.push("");
    lines.push("export type Variables = Record<string, any>;");
    lines.push("export interface GQLResponse<T> {");
    lines.push("  data?: T;");
    lines.push("  errors?: { message: string }[];");
    lines.push("}");
    lines.push("");
    lines.push("export async function call<T>(");
    lines.push("  query: string,");
    lines.push("  variables?: Variables,");
    lines.push("): Promise<GQLResponse<T>> {");
    lines.push("  const cfg = loadConfig();");
    lines.push("  const headers: Record<string, string> = {");
    lines.push("    'content-type': 'application/json',");
    lines.push("    ...(cfg.headers || {}),");
    lines.push("  };");
    lines.push("  if (cfg.auth.type === 'basic')");
    lines.push("    headers['authorization'] =");
    lines.push("      'Basic ' +");
    lines.push("      Buffer.from(cfg.auth.username + ':' + cfg.auth.password).toString(");
    lines.push("        'base64',");
    lines.push("      );");
    lines.push("  if (cfg.auth.type === 'bearer')");
    lines.push("    headers['authorization'] = 'Bearer ' + cfg.auth.token;");
    lines.push("  const res = await fetch(cfg.endpoint, {");
    lines.push("    method: 'POST',");
    lines.push("    headers,");
    lines.push("    body: JSON.stringify({ query, variables }),");
    lines.push("  });");
    lines.push("  return res.json() as Promise<GQLResponse<T>>;");
    lines.push("}\n");
    writeFileSync(path.join(baseDir, "utils.ts"), lines.join("\n"));
}
function generateOperations(operationType, root, types, baseDir, folderName) {
    if (!root?.fields)
        return;
    const lines = [];
    lines.push("// AUTO-GENERATED - DO NOT EDIT");
    lines.push("import { call } from '../utils.js';");
    lines.push("import type { Order, Pizza } from '../types/index.js';");
    lines.push("");
    root.fields.forEach((f) => {
        const varDecls = [];
        const varUsage = [];
        const gqlVars = [];
        f.args.forEach((a) => {
            const tsType = unwrap(a.type);
            const gqlType = getGraphQLTypeName(a.type);
            varDecls.push(`${a.name}: ${tsType}`);
            varUsage.push(a.name);
            gqlVars.push(`$${a.name}: ${gqlType}`);
        });
        const returnType = unwrap(f.type);
        const funcName = f.name;
        const signature = varDecls.length
            ? `(vars: { ${varDecls.join("; ")} })`
            : "()";
        const varsObj = varUsage.length ? "vars" : "undefined";
        const gqlVarDef = gqlVars.length ? `(${gqlVars.join(", ")})` : "";
        const gqlFieldArgs = varUsage.length
            ? `(${varUsage.map((v) => `${v}: $${v}`).join(", ")})`
            : "";
        const selectionSet = buildSelectionSet(f.type, types);
        lines.push(`export async function ${funcName}${signature}: Promise<${returnType}> {`);
        lines.push(`  const q = \`${operationType} ${funcName}${gqlVarDef} { ${funcName}${gqlFieldArgs}${selectionSet} }\`;`);
        lines.push(`  const r = await call<{ ${funcName}: ${returnType} }>(q, ${varsObj});`);
        lines.push(`  if (r.errors) throw new Error(r.errors.map((e) => e.message).join('; '));`);
        lines.push(`  return r.data!.${funcName};`);
        lines.push("}");
        lines.push("");
    });
    writeFileSync(path.join(baseDir, folderName, "index.ts"), lines.join("\n"));
}
function generateIndexFile(baseDir, queryType, mutationType) {
    const lines = [];
    lines.push("// AUTO-GENERATED - DO NOT EDIT");
    lines.push("// Main entry point for generated GraphQL client");
    lines.push("");
    lines.push("// Re-export types");
    lines.push("export * as types from './types/index.js';");
    lines.push("");
    if (queryType?.fields) {
        lines.push("// Re-export queries");
        lines.push("export * as queries from './queries/index.js';");
        lines.push("");
    }
    if (mutationType?.fields) {
        lines.push("// Re-export mutations");
        lines.push("export * as mutations from './mutations/index.js';");
        lines.push("");
    }
    lines.push("// Re-export utilities");
    lines.push("export { call, type Variables, type GQLResponse } from './utils.js';\n");
    writeFileSync(path.join(baseDir, "index.ts"), lines.join("\n"));
}
//# sourceMappingURL=generate.js.map