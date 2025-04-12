import {describe, expect, test} from 'vitest';
import {PaletteStyle} from '../src/constants/PaletteStyle.ts';

const PALETTE_ENTRIES = [
  'Monochrome',
  'Neutral',
  'TonalSpot',
  'Vibrant',
  'Expressive',
  'Fidelity',
  'Content',
  'Rainbow',
  'FruitSalad',
] as const;

describe('PaletteStyle', () => {
  describe('Static Instances', () => {
    test.each(PALETTE_ENTRIES)('%s has correct name and variant', (name) => {
      const paletteStyle = PaletteStyle.fromName(name)

      expect(paletteStyle.name).toBe(name);
      expect(paletteStyle.variant).toBe(PALETTE_ENTRIES.indexOf(name));
    });
  });

  describe('getAll()', () => {
    test('returns all instances in order', () => {
      const values = PaletteStyle.getAll();
      expect(values).toHaveLength(PALETTE_ENTRIES.length);
      values.forEach((instance, index) => {
        expect(instance.name).toBe(PALETTE_ENTRIES[index]);
      });
    });
  });

  describe('fromName()', () => {
    test.each(PALETTE_ENTRIES)('retrieves %s instance', (name) => {
      const instance = PaletteStyle.fromName(name);
      expect(instance.name).toBe(name);
    });

    test('throws error for invalid name', () => {
      expect(() => PaletteStyle.fromName('Invalid')).toThrowError(
        'Invalid PaletteStyle: Invalid',
      );
    });
  });

  test('should normalize style names to PascalCase', () => {
    const testCases = [
      {input: 'tonal-spot', expected: 'TonalSpot'},
      {input: 'TonalSpot', expected: 'TonalSpot'},
      {input: 'tonal_spot', expected: 'TonalSpot'},
      {input: 'FruitSalad', expected: 'FruitSalad'},
      {input: 'fruit salad', expected: 'FruitSalad'},
      {input: 'Fruit_Salad', expected: 'FruitSalad'},
    ];

    testCases.forEach(({input, expected}) => {
      expect(PaletteStyle.normalize(input)).toBe(expected);
    });
  });

});
