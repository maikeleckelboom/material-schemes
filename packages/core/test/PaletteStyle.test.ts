import { describe, expect, test } from 'vitest';
import { PaletteStyle } from '../src/constants/PaletteStyle.ts';

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
      const instance = PaletteStyle.valueOf(name)

      expect(instance.name).toBe(name);
      expect(instance.variant).toBe(PALETTE_ENTRIES.indexOf(name));
    });
  });

  describe('values()', () => {
    test('returns all instances in order', () => {
      const values = PaletteStyle.values();
      console.log(values);
      expect(values).toHaveLength(PALETTE_ENTRIES.length);
      values.forEach((instance, index) => {
        expect(instance.name).toBe(PALETTE_ENTRIES[index]);
      });
    });
  });

  describe('valueOf()', () => {
    test.each(PALETTE_ENTRIES)('retrieves %s instance', (name) => {
      const instance = PaletteStyle.valueOf(name);
      expect(instance.name).toBe(name);
    });

    test('throws error for invalid name', () => {
      expect(() => PaletteStyle.valueOf('Invalid')).toThrowError(
        'PaletteStyle not found: Invalid',
      );
    });
  });
});
