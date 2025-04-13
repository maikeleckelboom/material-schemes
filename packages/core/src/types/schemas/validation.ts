import {z, type  ZodTypeAny} from 'zod';
import {formatZodError} from './error-formatter.ts';

export class ValidationError extends Error {
  constructor(
    public readonly message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validate<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(
      'Invalid data format',
      formatZodError(result.error)
    );
  }

  return result.data;
}

