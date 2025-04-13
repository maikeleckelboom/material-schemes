import {describe, expect, it} from 'vitest';
import {ContrastThreshold} from '../src/theme/ContrastThreshold.ts';

describe('ContrastThreshold', () => {

  describe('closest', () => {
    const testCases = [
      {input: 2, expected: 'WCAG_AA_LARGE_TEXT'},
      {input: 3, expected: 'WCAG_AA_LARGE_TEXT'},
      {input: 3.5, expected: 'WCAG_AA_LARGE_TEXT'},
      {input: 4, expected: 'WCAG_AA_LARGE_TEXT'},
      {input: 4.5, expected: 'WCAG_AAA_LARGE_TEXT'},
      {input: 5, expected: 'WCAG_AAA_LARGE_TEXT'},
      {input: 6.9, expected: 'WCAG_AAA_LARGE_TEXT'},
      {input: 7, expected: 'WCAG_AAA_NORMAL_TEXT'},
      {input: 10, expected: 'WCAG_AAA_NORMAL_TEXT'},
    ];

    testCases.forEach(({input, expected}) => {
      it(`should return ${expected} for ${input}`, () => {
        const result = ContrastThreshold.closest(input);
        expect(result.name).toBe(expected);
      });
    });

    it('should return default threshold when no matches', () => {
      const result = ContrastThreshold.closest(-1);
      expect(result.name).toBe('WCAG_AA_LARGE_TEXT');
    });

    it('should return WCAG_AA_NORMAL_TEXT from 4.5', () => {
      const result = ContrastThreshold.fromName('WCAG_AA_NORMAL_TEXT')
      expect(result.value).toBe(4.5);
    });
  });

});
