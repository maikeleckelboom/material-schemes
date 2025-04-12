import {consola} from 'consola'
import {logger} from './logger';

export function handleError(error: unknown) {

  if (typeof error === 'string') {
    consola.error('error', error)
    process.exit(1)
  }

  if (error instanceof Error) {
    consola.error(error.message)

    if (process.env.NODE_ENV === 'development') {
      logger.log('stack', error.stack);
    }

    process.exit(1)
  }

  consola.error('Something went wrong. Please try again.')
  process.exit(1)
}

export class ExitPromptError extends Error {
  constructor() {
    super('Exit prompt');
    this.name = 'ExitPromptError';
  }
}
