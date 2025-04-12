import {describe, expect, it} from 'vitest';
import {Contrast} from '../src/constants/Contrast.ts';

describe('Contrast', () => {
  describe('values()', () => {
    it('should return all levels sorted by value', () => {
      const result = Contrast.values();

      expect(result).toHaveLength(4);

      const expectedValues = [
        {name: 'REDUCED', value: -1, label: 'Reduced'},
        {name: 'DEFAULT', value: 0, label: 'Default'},
        {name: 'MEDIUM', value: 0.25, label: 'Medium'},
        {name: 'HIGH', value: 0.5, label: 'High'},
      ];

      expectedValues.forEach((expected, index) => {
        const level = result[index];
        expect(level?.name).toBe(expected.name);
        expect(level?.value).toBe(expected.value);
        expect(level?.label).toBe(expected.label);
      });

      expect(result.map((l) => l.value)).toEqual(expectedValues.map((e) => e.value));
    });
  });

  describe('closestContrastLevel', () => {
    const testCases = [
      {input: -1, expected: 'REDUCED'},
      {input: -0.5, expected: 'REDUCED'},
      {input: 0, expected: 'DEFAULT'},
      {input: 0.1, expected: 'DEFAULT'},
      {input: 0.25, expected: 'MEDIUM'},
      {input: 0.3, expected: 'MEDIUM'},
      {input: 0.5, expected: 'HIGH'},
      {input: 0.6, expected: 'HIGH'},
      {input: 1, expected: 'HIGH'},
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for input ${input}`, () => {
        const result = Contrast.closestContrastLevel(input);
        expect(result.name).toBe(expected);
      });
    });

    it('should return reduced level for negative values', () => {
      const result = Contrast.closestContrastLevel(-0.1);
      expect(result).toBe(Contrast.REDUCED);
    });

    it('should return default level for zero', () => {
      const result = Contrast.closestContrastLevel(0);
      expect(result).toBe(Contrast.DEFAULT);
    });

    it('should return high level for values greater than highest', () => {
      const result = Contrast.closestContrastLevel(1.5);
      expect(result).toBe(Contrast.HIGH);
    });

    it('should handle exact matches', () => {
      expect(Contrast.closestContrastLevel(0).name).toBe('DEFAULT');
      expect(Contrast.closestContrastLevel(0.25).name).toBe('MEDIUM');
      expect(Contrast.closestContrastLevel(0.5).name).toBe('HIGH');
    });

    it('should handle values between levels', () => {
      expect(Contrast.closestContrastLevel(0.15).name).toBe('DEFAULT');
      expect(Contrast.closestContrastLevel(0.3).name).toBe('MEDIUM');
      expect(Contrast.closestContrastLevel(0.4).name).toBe('MEDIUM');
    });
  });
});
