import {describe, it, expect} from 'vitest';
import {createMaterialTheme} from '../../src/fn/create-material-theme';
import {MaterialTheme} from '../../src/theme';
import {PaletteStyle} from '../../src/theme';
import type {ExtendedColor} from '../../src/types';
import {toArgb} from "../../src";

describe('createMaterialTheme', () => {
  it('should create a theme with just a source color', () => {
    const sourceColor = '#6750A4';
    const theme = createMaterialTheme(sourceColor);

    expect(theme).toBeInstanceOf(MaterialTheme);
    expect(theme.style).toEqual(PaletteStyle.TonalSpot);
    expect(theme.contrastLevel).toEqual(0);
    expect(theme.extendedColors).toEqual([]);
  });

  it('should create a theme with a source color and options', () => {
    const sourceColor = '#6750A4';
    const options = {
      style: 'Vibrant',
      contrastLevel: 0.5,
    } as const;
    const theme = createMaterialTheme(sourceColor, options);

    expect(theme).toBeInstanceOf(MaterialTheme);
    expect(theme.style).toEqual(PaletteStyle.Vibrant);
    expect(theme.contrastLevel).toEqual(0.5);
  });

  it('should create a theme with a source color and extended colors', () => {
    const sourceColor = '#6750A4';
    const extendedColors: ExtendedColor[] = [
      {
        name: 'custom',
        value: '#FF0000',
        blend: true,
        description: 'Custom red color'
      }
    ];
    const theme = createMaterialTheme(sourceColor, extendedColors);

    expect(theme).toBeInstanceOf(MaterialTheme);
    expect(theme.extendedColors).toHaveLength(1);
    // expect(theme.extendedColors[0]!.color.name).toEqual('custom');
  });

  it('should create a theme with a MaterialThemeOptions object', () => {
    const theme = createMaterialTheme({
      sourceColor: '#6750A4',
      style: 'Expressive',
      contrastLevel: 0.2,
      primary: '#FF0000',
      secondary: '#00FF00',
      tertiary: '#0000FF',
      extendedColors: [
        {
          name: 'custom',
          value: '#FF00FF',
          blend: true
        }
      ]
    });

    expect(theme).toBeInstanceOf(MaterialTheme);
    expect(theme.style).toEqual(PaletteStyle.Expressive);
    expect(theme.contrastLevel).toEqual(0.2);
    expect(theme.extendedColors).toHaveLength(1);
    expect(theme.extendedColors[0]!.color.name).toEqual('custom');
  });

  it('should respect hexadecimal number format for source color', () => {
    const sourceColor = 0xFF6750A4; // Hexadecimal number representation
    const theme = createMaterialTheme(sourceColor);

    expect(theme).toBeInstanceOf(MaterialTheme);
    // The sourceColorArgb property should contain the same value
    expect(theme.sourceColorArgb).toEqual(toArgb(sourceColor));
  });

  it('should handle different palette configurations', () => {
    const options = {
      sourceColor: '#6750A4',
      primary: '#FF0000',
      secondary: '#00FF00',
      tertiary: '#0000FF',
      neutral: '#CCCCCC',
      neutralVariant: '#999999'
    };
    const theme = createMaterialTheme(options);

    expect(theme).toBeInstanceOf(MaterialTheme);
    // Verify that palettes are properly set
    expect(theme.palettes).toHaveProperty('primary');
    expect(theme.palettes).toHaveProperty('secondary');
    expect(theme.palettes).toHaveProperty('tertiary');
    expect(theme.palettes).toHaveProperty('neutral');
    expect(theme.palettes).toHaveProperty('neutralVariant');
    expect(theme.palettes).toHaveProperty('error');
  });
});
