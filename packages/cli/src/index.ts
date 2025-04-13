import {Command, type CommanderError} from 'commander';
import {logger} from './utils/logger';
import {generateCommand} from './commands/generate';
import {CustomError} from "./utils/errors";
import {getErrorExitCode, handleError} from "./utils/error";

import {version} from '../package.json' assert {type: 'json'};

async function main() {
  const program = new Command();

  try {
    program
      .name('material-schemes/cli')
      .description('A CLI for generating complete Material 3 color schemes')
      .version(version)
      .configureOutput({
        writeOut: (str) => logger.info(str),
        writeErr: (str) => logger.error(`[Commander] ${str}`),  // Add context
      })
      .exitOverride((err: CommanderError) => {
        throw new CustomError(err.message, err.exitCode, {code: err.code});
      })
      .showHelpAfterError('(add --help for additional information)');

    program.addCommand(generateCommand);

    await program.parseAsync(process.argv);

  } catch (error: unknown) {
    handleError(error);
    process.exit(getErrorExitCode(error));
  }
}

// Global error handlers
process.on('uncaughtException', (error: Error) => {
  handleError(error);
  process.exit(getErrorExitCode(error));
});

process.on('unhandledRejection', (reason: unknown) => {
  handleError(reason);
  process.exit(getErrorExitCode(reason));
});

// Start the CLI
main();
