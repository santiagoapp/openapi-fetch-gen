#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import yaml from "js-yaml";
import { SchemaParser } from "./generator/parser";
import { CodeGenerator } from "./generator/generator";
import {
  GeneratorConfig,
  OpenAPISchema,
  SchemaObject,
  ReferenceObject,
} from "./types";

// OpenAPI specific types

function resolveRef(schema: OpenAPISchema, ref: string): SchemaObject {
  if (ref.startsWith("#/")) {
    const parts = ref.slice(2).split("/");
    let current: SchemaObject | ReferenceObject | undefined = schema;

    for (const part of parts) {
      if (current === undefined) {
        throw new Error(`Unable to resolve reference: ${ref}`);
      }
      current = (current as SchemaObject)[part] as
        | SchemaObject
        | ReferenceObject;
    }
    if (current && typeof current === "object" && !("$ref" in current)) {
      return current as SchemaObject;
    }
    throw new Error(`Resolved reference is not a SchemaObject: ${ref}`);
  }

  throw new Error(`External references are not supported: ${ref}`);
}

function resolveReferences(
  obj: OpenAPISchema | SchemaObject,
  schema: OpenAPISchema
): OpenAPISchema | SchemaObject {
  if (Array.isArray(obj)) {
    return obj.map((item) => resolveReferences(item, schema));
  }

  if (obj && typeof obj === "object") {
    if ("$ref" in obj) {
      const resolved = resolveRef(schema, obj["$ref"]);
      // Recursively resolve any refs in the resolved object
      return resolveReferences(resolved, schema);
    }

    const result: Record<string, SchemaObject | ReferenceObject> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveReferences(value, schema);
    }
    return result;
  }

  return obj;
}

async function parseYamlSchema(schemaYaml: string): Promise<OpenAPISchema> {
  try {
    // const content = await fs.readFile(filePath, "utf-8");
    const schema = yaml.load(schemaYaml) as OpenAPISchema;

    if (!schema.openapi || !schema.info || !schema.paths) {
      throw new Error(
        "Invalid OpenAPI schema: missing required fields (openapi, info, or paths)"
      );
    }

    // Resolve all references in the schema
    const resolvedSchema = resolveReferences(schema, schema) as OpenAPISchema;

    return resolvedSchema;
  } catch (error) {
    throw new Error(
      `Failed to parse YAML schema file: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function getSchemaPath(baseUrl: string): Promise<string> {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${response.statusText}`);
  }
  return await response.text();
}

async function main() {
  const opts = program.opts();
  try {
    const schemaYaml = await getSchemaPath(opts.baseUrl);
    const schema = await parseYamlSchema(schemaYaml);

    // Configure generator
    const config: GeneratorConfig = {
      schemaPath: opts.schema,
      outputPath: path.resolve(process.cwd(), opts.output),
      baseUrl: opts.baseUrl,
      hooks: {
        react: opts.hooks?.includes("react"),
        swr: opts.hooks?.includes("swr"),
        tanstack: opts.hooks?.includes("tanstack"),
      },
      typescript: {
        strict: opts.strict,
      },
    };

    // Parse schema
    const parser = new SchemaParser(schema);
    const operations = await parser.parseSchema();

    // Generate code
    const generator = new CodeGenerator(config);
    await generator.generate(operations);

    console.log("✨ Code generation completed successfully!");
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
    process.exit(1);
  }
}

const program = new Command()
  .name("openapi-fetch-gen")
  .description("Generate TypeScript API client from OpenAPI schema")
  .version("0.1.0")
  .requiredOption("-o, --output <path>", "Output directory")
  .option("-s, --schema <path>", "OpenAPI schema path (YAML)")
  .option("--base-url <url>", "Base URL for the API")
  .option(
    "--hooks <types>",
    "Generate hooks (comma-separated: react,swr,tanstack)"
  )
  .option("--strict", "Enable strict TypeScript checking")
  .parse(process.argv);

main();
