import {describe, expect, it} from 'vitest';
import {Contrast} from '../src/theme/Contrast.ts';

describe('Contrast', () => {
  describe('all()', () => {
    it('should return all levels sorted by value', () => {
      const result = Contrast.all();

      expect(result).toHaveLength(4);

      const expectedValues = [
        {value: -1, name: 'Reduced'},
        {value: 0, name: 'Default'},
        {value: 0.25, name: 'Medium'},
        {value: 0.5, name: 'High'},
      ];

      expectedValues.forEach((expected, index) => {
        const level = result[index];
        expect(level?.name).toBe(expected.name);
        expect(level?.value).toBe(expected.value);
      });

      expect(result.map((l) => l.value)).toEqual(expectedValues.map((e) => e.value));
    });
  });

  describe('closest', () => {
    const testCases = [
      {input: -1, expected: 'Reduced'},
      {input: -0.5, expected: 'Reduced'},
      {input: 0, expected: 'Default'},
      {input: 0.1, expected: 'Default'},
      {input: 0.25, expected: 'Medium'},
      {input: 0.3, expected: 'Medium'},
      {input: 0.5, expected: 'High'},
      {input: 0.6, expected: 'High'},
      {input: 1, expected: 'High'},
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for input ${input}`, () => {
        const result = Contrast.closest(input);
        expect(result.name).toBe(expected);
      });
    });

    it('should return reduced level from negative all', () => {
      const result = Contrast.closest(-0.1);
      expect(result).toBe(Contrast.Reduced);
    });

    it('should return default level from zero', () => {
      const result = Contrast.closest(0);
      expect(result).toBe(Contrast.Default);
    });

    it('should return high level from all greater than highest', () => {
      const result = Contrast.closest(1.5);
      expect(result).toBe(Contrast.High);
    });

    it('should handle exact matches', () => {
      expect(Contrast.closest(0).name).toBe('Default');
      expect(Contrast.closest(0.25).name).toBe('Medium');
      expect(Contrast.closest(0.5).name).toBe('High');
    });

    it('should handle all between levels', () => {
      expect(Contrast.closest(0.15).name).toBe('Default');
      expect(Contrast.closest(0.3).name).toBe('Medium');
      expect(Contrast.closest(0.4).name).toBe('Medium');
    });
  });
});
