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
    test.each(PALETTE_ENTRIES)('%s has correct name and value', (name) => {
      const paletteStyle = PaletteStyle.from(name)

      expect(paletteStyle.name).toBe(name);
      expect(paletteStyle.value).toBe(PALETTE_ENTRIES.indexOf(name));
    });
  });

  describe('values()', () => {
    test('returns values instances in order', () => {
      const values = PaletteStyle.values();
      expect(values).toHaveLength(PALETTE_ENTRIES.length);
      values.forEach((instance, index) => {
        expect(instance.name).toBe(PALETTE_ENTRIES[index]);
      });
    });
  });

  describe('fromName()', () => {
    test.each(PALETTE_ENTRIES)('retrieves %s instance', (name) => {
      const instance = PaletteStyle.from(name);
      expect(instance.name).toBe(name);
    });
  });

});
