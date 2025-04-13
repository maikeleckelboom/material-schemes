// utils/error.ts
import { consola } from 'consola';
import { logger } from './logger';
import { CustomError } from './errors';

export class ExitPromptError extends Error {
  constructor() {
    super('Operation cancelled by user');
    this.name = 'ExitPromptError';
  }
}

export function handleError(error: unknown) {
  if (typeof error === 'string') {
    consola.error(error);
    return;
  }

  if (error instanceof ExitPromptError) {
    consola.warn('👋 ' + error.message);
    return;
  }

  if (error instanceof CustomError) {
    consola.error(error.message);
    if (process.env.NODE_ENV === 'development') {
      logger.log('Error Context:', error.context);
      logger.log('Stack:', error.stack);
    }
    return;
  }

  if (error instanceof Error) {
    consola.error(error.message);
    if (process.env.NODE_ENV === 'development' && error.stack) {
      logger.log('Stack:', error.stack);
    }
    return;
  }

  consola.error('Something went wrong. Please try again.');
}

export function getErrorExitCode(error: unknown): number {
  if (error instanceof CustomError) {
    const commanderCode = error.context?.code;
    if (commanderCode === 'commander.helpDisplayed' || commanderCode === 'commander.version') {
      return 0;
    }
    return error.statusCode || 1;
  }

  if (error instanceof ExitPromptError) {
    return 0;
  }

  return 1;
}
