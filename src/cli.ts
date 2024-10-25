#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs/promises";
import { SchemaParser } from "./generator/parser";
import { CodeGenerator } from "./generator/generator";
import { GeneratorConfig } from "./types";

const program = new Command()
  .name("openapi-fetch-gen")
  .description("Generate TypeScript API client from OpenAPI schema")
  .version("0.1.0")
  .requiredOption("-s, --schema <path>", "OpenAPI schema path")
  .requiredOption("-o, --output <path>", "Output directory")
  .option("--base-url <url>", "Base URL for the API")
  .option(
    "--hooks <types>",
    "Generate hooks (comma-separated: react,swr,tanstack)"
  )
  .option("--strict", "Enable strict TypeScript checking")
  .parse(process.argv);

async function main() {
  const opts = program.opts();

  try {
    // Read and parse schema
    const schemaPath = path.resolve(process.cwd(), opts.schema);
    const schemaContent = await fs.readFile(schemaPath, "utf-8");
    const schema = JSON.parse(schemaContent);

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

main();
