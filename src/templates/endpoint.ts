import { ParsedOperation } from "../types";
import { OpenAPIV3 } from 'openapi-types';

/**
 * Generates a TypeScript fetch API endpoint function based on an OpenAPI operation.
 * 
 * @param operation - The parsed OpenAPI operation object
 * @returns A string containing the generated TypeScript code for the endpoint
 */
export function generateEndpoint(operation: ParsedOperation): string {

  const { operationId, method, path, requestBody, parameters } = operation;

  // Extract path parameter names from the URL path (e.g., {id} -> id)
  const pathParamNames = extractPathParameters(path);

  // Generate function parameters for required path parameters
  const functionParams = generateFunctionParams(pathParamNames, operationId, parameters);

  // Generate code for handling path parameters and constructing the URL
  const urlConstructionCode = generateUrlCode(path, pathParamNames, functionParams.hasRequiredParams);

  // Generate the complete endpoint function
  return `
import type { ${operationId}Params, ${operationId}Response } from '../types/${operationId}.types';
export type { ${operationId}Params, ${operationId}Response };

/**
 * ${getOperationDescription(operationId, method, path)}
 */
export async function ${operationId}(
  ${functionParams.paramsString}
): Promise<${operationId}Response> {${urlConstructionCode}

  // Configure the fetch request
  const fetchOptions = {
    method: '${method.toUpperCase()}',
    headers: {
      'Content-Type': 'application/json',
      ...params.headers
    },
    ${generateRequestBodyCode(method, requestBody)}
  };

  // Send the request
  const response = await fetch(url.toString(), fetchOptions);

  // Handle errors
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  // Parse and return the response
  return response.json();
}`;
}

/**
 * Extracts path parameter names from a URL path
 */
function extractPathParameters(path: string): string[] {
  return (path.match(/\{([^}]+)\}/g) || [])
    .map(param => param.slice(1, -1));
}

/**
 * Generates function parameters for required path parameters
 */
function generateFunctionParams(pathParamNames: string[], operationId: string, parameters?: OpenAPIV3.ParameterObject[]): { paramsString: string; hasRequiredParams: boolean } {
  if (!pathParamNames.length) {
    return {
      paramsString: `params: ${operationId}Params = {}`,
      hasRequiredParams: false
    };
  }

  // Extract parameter types from OpenAPI parameters
  const paramTypes: Record<string, string> = {};
  if (parameters) {
    parameters
      .filter(param => param.in === 'path')
      .forEach(param => {
        const schema = param.schema as OpenAPIV3.SchemaObject;
        paramTypes[param.name] = getTypeFromSchema(schema);
      });
  }

  // Generate required parameters as explicit function parameters
  const requiredParams = pathParamNames.map(name => {
    const type = paramTypes[name] || 'string';
    return `${name}: ${type}`;
  }).join(', ');

  return {
    paramsString: `${requiredParams}, params: Omit<${operationId}Params, ${pathParamNames.map(p => `'${p}'`).join(' | ')}> = {}`,
    hasRequiredParams: true
  };
}

/**
 * Gets TypeScript type from OpenAPI schema
 */
function getTypeFromSchema(schema?: OpenAPIV3.SchemaObject): string {
  if (!schema) return 'string';

  switch (schema.type) {
    case 'string': return 'string';
    case 'number':
    case 'integer': return 'number';
    case 'boolean': return 'boolean';
    default: return 'string';
  }
}

/**
 * Generates code for URL construction and path parameter validation
 */
function generateUrlCode(path: string, pathParamNames: string[], hasRequiredParams: boolean): string {
  if (pathParamNames.length === 0) {
    return `
  const url = new URL(\`\${window.BACKEND_URL}${path}\`);`;
  }

  if (hasRequiredParams) {
    return `
  // Replace path parameters in URL
  let pathUrl = "${path}";
  ${pathParamNames.map(paramName => {
      return `pathUrl = pathUrl.replace('{${paramName}}', encodeURIComponent(String(${paramName})));`;
    }).join('\n  ')}
  const url = new URL(\`\${window.BACKEND_URL}\${pathUrl}\`);`;
  } else {
    return `
  // Replace path parameters in URL
  let pathUrl = "${path}";
  ${pathParamNames.map(paramName => {
      return `// Path parameter '${paramName}' is required
  if (params.${paramName} === undefined || params.${paramName} === null) {
    throw new Error(\`Path parameter '${paramName}' is required\`);
  }
  pathUrl = pathUrl.replace('{${paramName}}', encodeURIComponent(String(params.${paramName})));`;
    }).join('\n  ')}
  const url = new URL(\`\${window.BACKEND_URL}\${pathUrl}\`);`;
  }
}

/**
 * Generates code for handling request body if needed
 */
function generateRequestBodyCode(method: string, requestBody?: OpenAPIV3.RequestBodyObject | undefined): string {
  if (method.toLowerCase() !== "get" && requestBody) {
    return "body: JSON.stringify(params.body),";
  }
  return "";
}

/**
 * Creates a human-readable description for the operation
 */
function getOperationDescription(operationId: string, method: string, path: string): string {
  const methodUpperCase = method.toUpperCase();
  const pathParams = extractPathParameters(path);

  if (pathParams.length === 0) {
    return `Makes a ${methodUpperCase} request to ${path}`;
  }

  const paramsDescription = pathParams.map(param => `@param {string} ${param} - Required path parameter`).join('\n * ');

  return `Makes a ${methodUpperCase} request to ${path}\n * \n * ${paramsDescription}`;
}
