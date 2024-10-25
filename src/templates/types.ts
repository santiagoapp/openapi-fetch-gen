import { OpenAPIV3 } from "openapi-types";
import { ParsedOperation } from "../types";

function generateParamsInterface(operation: ParsedOperation): string {
  const parts: string[] = [];

  // Add query parameters
  if (operation.parameters) {
    operation.parameters
      .filter((param) => param.in === "query")
      .forEach((param) => {
        const schema = (param as OpenAPIV3.ParameterObject)
          .schema as OpenAPIV3.SchemaObject;
        parts.push(`${param.name}?: ${getTypeFromSchema(schema)};`);
      });
  }

  // Add request body if present
  if (operation.requestBody && !("$ref" in operation.requestBody)) {
    const content = operation.requestBody.content?.["application/json"];
    if (content?.schema) {
      parts.push(
        `body?: ${getTypeFromSchema(content.schema as OpenAPIV3.SchemaObject)};`
      );
    }
  }

  // Add headers
  parts.push("headers?: Record<string, string>;");

  return parts.join("\n  ");
}

function generateResponseInterface(operation: ParsedOperation): string {
  const successResponse =
    operation.responses["200"] || operation.responses["201"];
  if (!successResponse || "$ref" in successResponse) {
    return "= any; // No success response defined";
  }

  const content = successResponse.content?.["application/json"];
  if (!content?.schema) {
    return "= any; // No JSON schema defined";
  }

  const schema = content.schema as OpenAPIV3.SchemaObject;
  return `= ${getTypeFromSchema(schema)}`;
}

function getTypeFromSchema(schema: OpenAPIV3.SchemaObject): string {
  switch (schema.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array": {
      if (schema.items) {
        const itemType = getTypeFromSchema(
          schema.items as OpenAPIV3.SchemaObject
        );
        return `Array<${itemType}>`;
      }
      return "Array<any>";
    }
    case "object": {
      if (schema.properties) {
        const props = Object.entries(schema.properties)
          .map(([key, prop]) => {
            const propSchema = prop as OpenAPIV3.SchemaObject;
            const required = schema.required?.includes(key);
            return `  ${key}${required ? "" : "?"}: ${getTypeFromSchema(propSchema)};`;
          })
          .join("\n");
        return `{
${props}
}`;
      }
      return "Record<string, any>";
    }
    default:
      return "any";
  }
}

export function generateTypes(operation: ParsedOperation): string {
  const { operationId } = operation;

  return `
export interface ${operationId}Params {
  ${generateParamsInterface(operation)}
}

export type ${operationId}Response ${generateResponseInterface(operation)}
`;
}
