import { ParsedOperation } from "../types";

export function generateReactHook(operation: ParsedOperation): string {
  const { operationId } = operation;

  return `
import { useState } from 'react';
import { ${operationId}, type ${operationId}Params, type ${operationId}Response } from '../endpoints/${operationId}';

export function use${operationId}() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<${operationId}Response | null>(null);

  const execute = async (params: ${operationId}Params = {}): Promise<${operationId}Response> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await ${operationId}(params);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    execute,
    isLoading,
    error,
    data
  };
}`;
}
