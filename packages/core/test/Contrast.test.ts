import {describe, expect, it} from 'vitest';
import {Contrast} from '../src/constants/Contrast.ts';

describe('Contrast', () => {
  describe('values()', () => {
    it('should return all levels sorted by value', () => {
      const result = Contrast.values();

      expect(result).toHaveLength(4);
      expect(result.map(l => l.value)).toEqual([-1, 0, 0.25, 0.5]);

      expect(result[0]?.name).toBe('REDUCED');
      expect(result[0]?.value).toBe(-1);
      expect(result[0]?.label).toBe('Reduced');

      expect(result[1]?.name).toBe('DEFAULT');
      expect(result[1]?.value).toBe(0);
      expect(result[1]?.label).toBe('Default');

      expect(result[2]?.name).toBe('MEDIUM');
      expect(result[2]?.value).toBe(0.25);
      expect(result[2]?.label).toBe('Medium');

      expect(result[3]?.name).toBe('HIGH');
      expect(result[3]?.value).toBe(0.5);
      expect(result[3]?.label).toBe('High');
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

  describe('Enum Structure', () => {
    it('should have correct numeric values', () => {
      expect(Contrast.valueOf('DEFAULT').value).toBe(0);
      expect(Contrast.valueOf('MEDIUM').value).toBe(0.25);
      expect(Contrast.valueOf('HIGH').value).toBe(0.5);
      expect(Contrast.valueOf('REDUCED').value).toBe(-1);
    });
  });
});
