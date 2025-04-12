import {Command, type CommanderError} from 'commander';
import {logger} from "./utils/logger.ts";
import {handleError} from "./utils/error.ts";
import {generateCommand} from "./commands/generate.ts";

const program = new Command();

program
  .name('material-schemes/cli')
  .description('A CLI that effortlessly generates complete Material 3 color schemes.')
  .version('0.0.1')
  .configureOutput({
    writeOut: (str: string) => logger.info(str),
    writeErr: (str: string) => logger.error(str),
  });

program.addCommand(generateCommand);

program.exitOverride((err: CommanderError) => {
  if (err.code === 'commander.help') process.exit(0);
  throw err;
});


program.hook('preAction', async (thisCommand: Command) => {
});

program.hook('postAction', async (thisCommand: Command) => {
});

process.on('uncaughtException', (error: Error) => {
  if (error.name === 'ExitPromptError') {
    logger.log('👋 Until next time!');
    process.exit(0);
  }
  handleError(error);
});

process.on('unhandledRejection', (reason: unknown) => {
  handleError(new Error(`Unhandled rejection: ${reason}`));
});

async function run() {
  try {
    await program.parseAsync(process.argv);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

run();
