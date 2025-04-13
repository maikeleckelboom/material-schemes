import {describe, expect, test} from 'vitest';
import {PaletteStyle} from '../src';

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
    test.each(PALETTE_ENTRIES)('%s has correct id and variant', (name) => {
      const paletteStyle = PaletteStyle.fromName(name)

      expect(paletteStyle.id).toBe(name);
      expect(paletteStyle.variant).toBe(PALETTE_ENTRIES.indexOf(name));
    });
  });

  describe('all()', () => {
    test('returns all instances in order', () => {
      const values = PaletteStyle.all();
      expect(values).toHaveLength(PALETTE_ENTRIES.length);
      values.forEach((instance, index) => {
        expect(instance.id).toBe(PALETTE_ENTRIES[index]);
      });
    });
  });

  describe('fromName()', () => {
    test.each(PALETTE_ENTRIES)('retrieves %s instance', (name) => {
      const instance = PaletteStyle.fromName(name);
      expect(instance.id).toBe(name);
    });

    test('throws error from invalid id', () => {
      expect(() => PaletteStyle.fromName('Invalid')).toThrowError()
    })
  });

  test('should normalizeName style names to PascalCase', () => {
    const testCases = [
      {input: 'tonal-spot', expected: 'TonalSpot'},
      {input: 'TonalSpot', expected: 'TonalSpot'},
      {input: 'tonal_spot', expected: 'TonalSpot'},
      {input: 'FruitSalad', expected: 'FruitSalad'},
      {input: 'fruit salad', expected: 'FruitSalad'},
      {input: 'Fruit_Salad', expected: 'FruitSalad'},
    ];

    testCases.forEach(({input, expected}) => {
      expect(PaletteStyle.normalizeName(input)).toBe(expected);
    });
  });

});
