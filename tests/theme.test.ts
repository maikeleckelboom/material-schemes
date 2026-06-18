import { describe, expect, it } from 'vitest';
import {
  PaletteStyle,
  createColorScheme,
  createCssVarMap,
  createTheme,
  getPaletteColors,
} from '../src';

describe('createTheme', () => {
  it('creates light and dark schemes with shared palettes', () => {
    const theme = createTheme('#6750a4', {
      variant: PaletteStyle.Vibrant,
      contrastLevel: 0.5,
      specVersion: '2025',
    });

    expect(theme.style).toBe(PaletteStyle.Vibrant);
    expect(theme.variant).toBe(PaletteStyle.Vibrant.value);
    expect(theme.contrastLevel).toBe(0.5);
    expect(theme.specVersion).toBe('2025');
    expect(theme.schemes.light.isDark).toBe(false);
    expect(theme.schemes.dark.isDark).toBe(true);
    expect(theme.palettes.primary).toBe(theme.schemes.light.primaryPalette);
  });

  it('includes custom colors and tonal palette output when requested', () => {
    const theme = createTheme({
      sourceColor: '#6750a4',
      customColors: [
        {
          name: 'Success Green',
          value: '#2e7d32',
          blend: true,
          description: 'Positive state color',
        },
      ],
    });

    const colorScheme = createColorScheme(theme, {
      brightnessVariants: true,
      paletteTones: [0, 40, 100],
    });

    expect(theme.customColors[0]?.color.description).toBe('Positive state color');
    expect(colorScheme.successGreen).toEqual(expect.any(Number));
    expect(colorScheme.successGreenLight).toEqual(expect.any(Number));
    expect(colorScheme.successGreenDark).toEqual(expect.any(Number));
    expect(colorScheme.primary40).toEqual(expect.any(Number));
    expect(colorScheme.successGreen100).toEqual(expect.any(Number));
  });

  it('creates CSS variable maps from theme color schemes', () => {
    const theme = createTheme('#6750a4');
    const cssVarMap = createCssVarMap(createColorScheme(theme));

    expect(cssVarMap['--primary']).toMatch(/^#[0-9a-f]{6}$/);
    expect(cssVarMap['--on-primary']).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('exposes stable palette tone helpers', () => {
    const theme = createTheme('#6750a4');
    const tones = getPaletteColors(theme.palettes.primary, [0, 40, 100]);

    expect(Object.keys(tones)).toEqual(['0', '40', '100']);
    expect(tones[40]).toBe(theme.palettes.primary.tone(40));
  });
});
