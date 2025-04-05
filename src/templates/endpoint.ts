import { ParsedOperation } from "../types";

// function generateQueryParams(operation: ParsedOperation): string {

//   if (!operation.parameters?.length) return "";

//   const queryParams = operation.parameters.filter(
//     (param) => param.in === "path"
//   );
//   if (queryParams.length === 0) return "";

//   return `
//   // Add query parameters
//   const queryParams = new URLSearchParams();
//   ${queryParams
//       .map(
//         (param) => `
//   if (params.${param.name} != null) {
//     queryParams.append('${param.name}', String(params.${param.name}));
//   }`
//       )
//       .join("\n")}
//   if (queryParams.toString()) {
//     url.search = queryParams.toString();
//   }`;
// }
// const url = new URL(\`\${window.BACKEND_URL}${path}\`);

export function generateEndpoint(operation: ParsedOperation): string {
  const { operationId, method, path, requestBody } = operation;

  return `
import type { ${operationId}Params, ${operationId}Response } from '../types/${operationId}.types';
export type { ${operationId}Params, ${operationId}Response };

export async function ${operationId}(
  params: ${operationId}Params = {}
): Promise<${operationId}Response> {
  const url = new URL(\`\${window.BACKEND_URL}${path}\`);

  const response = await fetch(url.toString(), {
    method: '${method.toUpperCase()}',
    ...params,
    headers: {
      'Content-Type': 'application/json',
      ...params.headers
    },
    ${method.toLowerCase() !== "get" && requestBody ? "body: JSON.stringify(params.body)," : ""}
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return response.json();
}`;
}
