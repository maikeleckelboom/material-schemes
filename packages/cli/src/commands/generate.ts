import {Command, type OptionValues} from 'commander';
import {select} from '@inquirer/prompts';
import {logger} from "../utils/logger.ts";

/**
 * Configuration options from generating a Material Design 3 color scheme
 */
interface ColorSchemeOptions {
  source?: string;
  primary?: string;
  secondary?: string;
  tertiary?: string;
  neutral?: string;
  neutralVariant?: string;
  style?: string;
  isDark?: boolean;
  contrastLevel?: string;
  variant?: string;

  [key: string]: any;
}


/**
 * Initializes the Material Design 3 color scheme generator.
 *
 * @command init
 * @description Generate a Material Design 3 color scheme.
 *
 * @option --source [color]
 * Seed color for generating the scheme (optional).
 *
 * @option --primary [color]
 * Override the primary palette color. Used for key UI components and primary actions.
 *
 * @option --secondary [color]
 * Override the secondary palette color. Used for less prominent components and secondary actions.
 *
 * @option --tertiary [color]
 * Override the tertiary palette color. Used for contrasting accents and special UI elements.
 *
 * @option --neutral [color]
 * Override the neutral palette color. Used for backgrounds, surfaces, and standard text.
 *
 * @option --neutral-variant [color]
 * Override the neutral variant palette color. Used for medium emphasis elements and component variants.
 *
 * @option --dark [boolean]
 * Generate a dark mode color scheme when true, light mode when false.
 *
 * @option --contrast-level [contrast-level]
 * Set the contrast level for accessibility (reduced | low | medium | high). Default is 'medium 0.0'.
 *
 * @option --style [style]
 * Specify the palette style variant (tonal-spot | expressive | vibrant | default). Default is 'tonal-spot'.
 *
 * @example
 * // Correct usage with hex color values:
 * // Note: The '#' character must be escaped or quoted to prevent shell misinterpretation.
 *
 * // Using quotes:
 * your-cli init --primary "#ff00ff"
 *
 * // Escaping the '#' character:
 * your-cli init --primary \#ff00ff
 *
 * // Using '=' to assign the value:
 * your-cli init --primary=#ff00ff
 *
 * // Incorrect usage (shell may ignore the argument after '#'):
 * your-cli init --primary #ff00ff
 */
export const generateCommand = new Command()
  .command('init')
  .description('Generate a Material Design 3 color scheme')
  .option('-s, --source [color]', 'Seed color for generating the scheme (optional)')
  .option('-p, --primary [color]', 'Override the primary palette color.')
  .option('-e, --secondary [color]', 'Override the secondary palette color.')
  .option('-t, --tertiary [color]', 'Override the tertiary palette color.')
  .option('-n, --neutral [color]', 'Override the neutral palette color.')
  .option('-v, --neutral-variant [color]', 'Override the neutral variant palette color.')
  .option('-d, --dark [boolean]', 'Generate a dark mode color scheme when true, light mode when false.', false)
  .option('-c, --contrast-level [contrast-level]', 'Set the contrast level for accessibility (reduced | low | medium | high)', 'medium 0.0')
  //     Monochrome,
  //     Neutral,
  //     TonalSpot,
  //     Vibrant,
  //     Expressive,
  //     Fidelity,
  //     Content,
  //     Rainbow,
  //     FruitSalad,

  .option('-y, --style [style]', 'Specify the palette style variant (tonal-spot | expressive | rain-bow | fidelity |  vibrant | content | fruit-salad | monochrome | vibrant)', 'tonal-spot')
  .action(async (options: OptionValues, command: Command) => {
    const config = await processConfig(options);
    logger.info('Processed the configuration', JSON.stringify(config, null, 2));
  });


/**
 * Process the configuration options for generating a color scheme.
 *
 * This function checks if essential color options are provided.
 * If not, it prompts the user to select from predefined choices.
 *
 * @param config - The initial configuration object.
 * @returns A promise that resolves to the processed configuration object with all essential options filled.
 */
async function processConfig(config: ColorSchemeOptions): Promise<ColorSchemeOptions> {

  const essentialOptions = {
    source: {
      message: 'Select a source color',
      choices: ['#FF0000', '#00FF00', '#0000FF'],
      default: '#FF0000',
    },
    primary: {
      message: 'Select a primary color',
      choices: ['#FF0000', '#00FF00', '#0000FF'],
      default: '#FF0000',
    },
    secondary: {
      message: 'Select a secondary color',
      choices: ['#FF0000', '#00FF00', '#0000FF'],
      default: '#00FF00',
    },
    tertiary: {
      message: 'Select a tertiary color',
      choices: ['#FF0000', '#00FF00', '#0000FF'],
      default: '#0000FF',
    },
    neutral: {
      message: 'Select a neutral color',
      choices: ['#FFFFFF', '#CCCCCC', '#999999'],
      default: '#FFFFFF',
    },
    neutralVariant: {
      message: 'Select a neutral variant color',
      choices: ['#FFFFFF', '#CCCCCC', '#999999'],
      default: '#CCCCCC',
    },
    style: {
      message: 'Select a palette style',
      choices: ['tonal-spot', 'expressive', 'vibrant'],
      default: 'tonal-spot',
    },
    contrast: {
      message: 'Select a contrast level',
      choices: ['reduced', 'low', 'medium', 'high'],
      default: 'medium',
    },
    isDark: {
      message: 'Should the scheme be in dark mode?',
      choices: ['true', 'false'],
      default: 'false',
    },
  } as const;

  for (const [key, settings] of Object.entries(essentialOptions)) {
    if (!config[key]) {
      config[key] = await select({
        message: settings.message,
        choices: settings.choices,
        default: settings.default,
      });
    }
  }

  return config;
}
