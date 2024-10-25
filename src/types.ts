import { OpenAPIV3 } from 'openapi-types';

export interface GeneratorConfig {
  schemaPath: string;
  outputPath: string;
  baseUrl?: string;
  hooks?: {
    react?: boolean;
    swr?: boolean;
    tanstack?: boolean;
  };
  typescript?: {
    strict?: boolean;
    eslint?: boolean;
  }
}

export interface ParsedOperation {
  operationId: string;
  path: string;
  method: string;
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: OpenAPIV3.ResponsesObject;
}