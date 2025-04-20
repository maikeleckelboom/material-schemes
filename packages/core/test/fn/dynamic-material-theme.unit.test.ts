import {describe, expect, vi, it} from 'vitest';
import type {ExtendedColor} from '../../src';
import {dynamicMaterialTheme, MaterialTheme, PaletteStyle, toArgb} from '../../src';

describe('dynamicMaterialTheme', () => {
  it('should create a theme with just a source color', () => {
    const sourceColor = '#6750A4';
    const theme = dynamicMaterialTheme(sourceColor);

    expect(theme).toBeInstanceOf(MaterialTheme);
    expect(theme.style).toEqual(PaletteStyle.TonalSpot);
    expect(theme.contrastLevel).toEqual(0);
    expect(theme.customColors).toEqual([]);
  });

  it('should create a theme with a source color and options', () => {
    const sourceColor = '#6750A4';
    const options = {
      style: 'Vibrant',
      contrastLevel: 0.5,
    } as const;
    const theme = dynamicMaterialTheme(sourceColor, options);

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
    const theme = dynamicMaterialTheme(sourceColor, extendedColors);

    expect(theme).toBeInstanceOf(MaterialTheme);
    expect(theme.customColors).toHaveLength(1);
    // expect(theme.customColors[0]!.color.name).toEqual('custom');
  });

  it('should create a theme with a MaterialThemeOptions object', () => {
    const theme = dynamicMaterialTheme({
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
    expect(theme.customColors).toHaveLength(1);
    expect(theme.customColors[0]!.color.name).toEqual('custom');
  });

  it('should respect hexadecimal number format for source color', () => {
    const sourceColor = 0xFF6750A4; // Hexadecimal number representation
    const theme = dynamicMaterialTheme(sourceColor);

    expect(theme).toBeInstanceOf(MaterialTheme);
    // The source property should contain the same value
    expect(theme.source).toEqual(toArgb(sourceColor));
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
    const theme = dynamicMaterialTheme(options);

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
