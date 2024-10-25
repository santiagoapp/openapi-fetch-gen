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
  responses: Record<string, ResponseObject>;
}

interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
}

export interface OpenAPISchema {
  openapi: string;
  info: OpenAPIInfo;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    [key: string]: Record<string, SchemaObject> | undefined;
  };
}

interface PathItem {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  delete?: OperationObject;
  patch?: OperationObject;
  [key: string]: OperationObject | undefined;
}

interface OperationObject {
  operationId?: string;
  tags?: string[];
  summary?: string;
  description?: string;
  responses: Record<string, ResponseObject>;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  security?: SecurityRequirementObject[];
}

interface ResponseObject {
  description?: string;
  content?: Record<string, MediaTypeObject>;
}

interface MediaTypeObject {
  schema: SchemaObject | ReferenceObject;
}

interface ParameterObject {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: SchemaObject | ReferenceObject;
}

interface RequestBodyObject {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
}

interface SecurityRequirementObject {
  [key: string]: string[];
}

export interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject | ReferenceObject>;
  items?: SchemaObject | ReferenceObject;
  required?: string[];
  enum?: unknown[];
  [key: string]: any;
}

export interface ReferenceObject {
  $ref: string;
}