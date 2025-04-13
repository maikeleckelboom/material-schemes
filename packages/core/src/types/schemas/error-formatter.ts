import {ZodError} from 'zod';

export function formatZodError(error: ZodError): string {
  return error.issues
    .map(issue => {
      const path = issue.path.join('.');
      const message = issue.message;
      return path ? `${path}: ${message}` : message;
    })
    .join('\n');
}
