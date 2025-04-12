import {Command, type OptionValues} from 'commander';
import {input, select} from '@inquirer/prompts';
import dedent from "dedent";

/**
 * Configuration options for generating a Material Design 3 color scheme
 */
interface ColorSchemeOptions {
  source?: string;
  primary?: string;
  secondary?: string;
  tertiary?: string;
  neutral?: string;
  neutralVariant?: string;
  dark?: boolean;
  light?: boolean;
  contrast?: string;
  variant?: string;
}

const description = dedent(`
  Generate a Material Design 3 color scheme based on a source color.
  See MD3 specs: https://m3.material.io/styles/color/overview
`)

export const generateCommand = new Command()
  .command('generate')
  .alias('gen')
  .description(description)
  .option('--source <color>', 'Base color for scheme generation (HEX or CSS color name)')
  .option('--primary <color>', 'Primary color override (HEX or CSS color name)')
  .option('--secondary <color>', 'Secondary color override')
  .option('--tertiary <color>', 'Tertiary color override')
  .option('--neutral <color>', 'Neutral color override')
  .option('--neutral-variant <color>', 'Neutral variant color override')
  .option('--dark <boolean>', 'Generate dark mode scheme')
  .option('-c, --contrast <contrast-level>', 'Contrast level (low|medium|high)', 'medium')
  .option('-v, --variant <palette-style>', 'Color scheme variant (tonal-spot|expressive|vibrant|default)')
  .action(async (options: OptionValues, command: Command) => {
    const config: ColorSchemeOptions = options;

    // Only prompt for these if not provided in CLI
    const essentialOptions = {
      variant: {
        message: 'Choose color scheme variant',
        choices: [
          {value: 'tonal-spot', name: 'Tonal Spot - Balanced contrast with tonal accents'},
          {value: 'expressive', name: 'Expressive - Vibrant, saturated colors'},
          {value: 'vibrant', name: 'Vibrant - High-contrast bold colors'},
          {value: 'default', name: 'Default - Material Design baseline'}
        ]
      },
      contrast: {
        message: 'Select contrast level',
        choices: [
          {value: 'high', name: 'High - Maximum readability'},
          {value: 'medium', name: 'Medium - Balanced contrast (recommended)'},
          {value: 'low', name: 'Low - Subtle contrast'}
        ]
      }
    };

    // Prompt for remaining essential options
    for (const [option, settings] of Object.entries(essentialOptions)) {
      // @ts-ignore
      if (!config[option]) {
        // @ts-ignore
        config[option] = await select(settings);
      }
    }

    // Add scheme generation logic
    console.log('Generating scheme with:', {
      ...config,
      // Default to light mode if no scheme specified
      mode: config.dark ? 'dark' : 'light'
    });
  });
