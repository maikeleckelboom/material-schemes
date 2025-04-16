import { describe, expect, it } from 'vitest';
import { ContrastLevel } from '../../src';

describe('ContrastLevel', () => {
  describe('ContrastLevel.closest()', () => {
    const testCases = [
      { input: -1, expected: 'Reduced' },
      { input: -0.5, expected: 'Reduced' },
      { input: 0, expected: 'Default' },
      { input: 0.1, expected: 'Default' },
      { input: 0.25, expected: 'Default' },
      { input: 0.3, expected: 'Default' },
      { input: 0.5, expected: 'Medium' },
      { input: 0.6, expected: 'Medium' },
      { input: 1, expected: 'High' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should return ${expected} for input ${input}`, () => {
        const result = ContrastLevel.closest(input);
        expect(result.name).toBe(expected);
      });
    });

    it('should return "Reduced" for entries just below zero', () => {
      const result = ContrastLevel.closest(-0.1);
      expect(result).toBe(ContrastLevel.Reduced);
    });

    it('should return "Default" for zero', () => {
      const result = ContrastLevel.closest(0);
      expect(result).toBe(ContrastLevel.Default);
    });

    it('should return "High" for entries beyond the highest threshold', () => {
      const result = ContrastLevel.closest(1.5);
      expect(result).toBe(ContrastLevel.High);
    });

    it('should handle exact matches for contrast levels', () => {
      expect(ContrastLevel.closest(-1).name).toBe('Reduced');
      expect(ContrastLevel.closest(0).name).toBe('Default');
      expect(ContrastLevel.closest(0.5).name).toBe('Medium');
      expect(ContrastLevel.closest(1).name).toBe('High');
    });

    it('should correctly classify entries between defined levels', () => {
      expect(ContrastLevel.closest(0.15).name).toBe('Default');
      expect(ContrastLevel.closest(0.3).name).toBe('Default');
      expect(ContrastLevel.closest(0.8).name).toBe('Medium');
    });
  });
});
