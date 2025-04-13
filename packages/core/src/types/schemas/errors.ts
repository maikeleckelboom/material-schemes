import type {ZodError} from "zod";

export type ApiError = {
  code: 'VALIDATION_ERROR';
  message: string;
  details?: string[];
};

export function handleValidationError(error: ZodError): ApiError {
  return {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data',
    details: error.issues.map(issue => issue.message)
  };
}
