import { ParsedOperation, GeneratorConfig } from "../types";
import { generateEndpoint } from "../templates/endpoint";
import { generateTypes } from "../templates/types";
import { generateReactHook } from "../templates/reactHook";
import fs from "fs/promises";
import path from "path";

export class CodeGenerator {
  constructor(private config: GeneratorConfig) {}

  async generate(operations: ParsedOperation[]): Promise<void> {
    await this.ensureOutputDir();

    for (const operation of operations) {
      // Generate endpoint
      const endpoint = generateEndpoint(operation);
      await this.writeFile(`endpoints/${operation.operationId}.ts`, endpoint);

      // Generate types
      const types = generateTypes(operation);
      await this.writeFile(`types/${operation.operationId}.types.ts`, types);

      // Generate hooks if configured
      if (this.config.hooks?.react) {
        const hook = generateReactHook(operation);
        await this.writeFile(`hooks/${operation.operationId}.hook.ts`, hook);
      }
    }

    // Generate index files
    await this.generateIndexFiles();
  }

  private async ensureOutputDir(): Promise<void> {
    const dirs = ["endpoints", "types", "hooks"].map((dir) =>
      path.join(this.config.outputPath, dir)
    );

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async writeFile(
    relativePath: string,
    content: string
  ): Promise<void> {
    const filePath = path.join(this.config.outputPath, relativePath);
    await fs.writeFile(filePath, content);
  }

  private async generateIndexFiles(): Promise<void> {
    // Implementation for generating index files
  }
}
