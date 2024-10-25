import { ParsedOperation } from "../types";

function generateQueryParams(operation: ParsedOperation): string {
  if (!operation.parameters?.length) return "";

  const queryParams = operation.parameters.filter(
    (param) => param.in === "query"
  );
  if (queryParams.length === 0) return "";

  return `
  // Add query parameters
  const queryParams = new URLSearchParams();
  ${queryParams
    .map(
      (param) => `
  if (params.${param.name} != null) {
    queryParams.append('${param.name}', String(params.${param.name}));
  }`
    )
    .join("\n")}
  if (queryParams.toString()) {
    url.search = queryParams.toString();
  }`;
}

export function generateEndpoint(operation: ParsedOperation): string {
  const { operationId, method, path } = operation;

  return `
import type { ${operationId}Params, ${operationId}Response } from '../types/${operationId}.types';

export type { ${operationId}Params, ${operationId}Response };

export async function ${operationId}(
  params: ${operationId}Params = {}
): Promise<${operationId}Response> {
  const url = new URL(\`\${process.env.API_BASE_URL}${path}\`);
  
  ${generateQueryParams(operation)}

  const response = await fetch(url.toString(), {
    method: '${method.toUpperCase()}',
    headers: {
      'Content-Type': 'application/json',
      ...params.headers
    },
    ${method.toLowerCase() !== "get" ? "body: JSON.stringify(params.body)," : ""}
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return response.json();
}`;
}
