import { OpenAPIV3 } from 'openapi-types';
import { ParsedOperation } from '../types';

export class SchemaParser {
  private schema: OpenAPIV3.Document;

  constructor(schema: OpenAPIV3.Document) {
    this.schema = schema;
  }

  async parseSchema(): Promise<ParsedOperation[]> {
    const operations: ParsedOperation[] = [];
    const paths = this.schema.paths;

    for (const [path, pathItem] of Object.entries(paths)) {
      if (!pathItem) continue;

      const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;
      
      for (const method of methods) {
        const operation = pathItem[method];
        if (operation) {
          operations.push({
            operationId: operation.operationId || this.generateOperationId(path, method),
            path,
            method,
            parameters: operation.parameters as OpenAPIV3.ParameterObject[],
            requestBody: operation.requestBody as OpenAPIV3.RequestBodyObject,
            responses: operation.responses
          });
        }
      }
    }

    return operations;
  }

  private isHttpMethod(method: string): method is OpenAPIV3.HttpMethods {
    return ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].includes(method.toLowerCase());
  }

  private generateOperationId(path: string, method: string): string {
    return `${method}${path.replace(/\W+/g, '_')}`.toLowerCase();
  }
}