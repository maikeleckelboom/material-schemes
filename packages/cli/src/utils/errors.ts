export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly context?: Record<string, any>; // Optional context data

  constructor(message: string, statusCode: number = 500, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = 'Validation failed', context?: Record<string, any>) {
    super(message, 400, context);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found', context?: Record<string, any>) {
    super(message, 404, context);
  }
}
