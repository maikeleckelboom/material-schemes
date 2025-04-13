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
    test.each(PALETTE_ENTRIES)('%s has correct id and value', (name) => {
      const paletteStyle = PaletteStyle.fromName(name)

      expect(paletteStyle.id).toBe(name);
      expect(paletteStyle.value).toBe(PALETTE_ENTRIES.indexOf(name));
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
  });

});
