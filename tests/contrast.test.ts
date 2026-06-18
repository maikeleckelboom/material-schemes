import { describe, expect, it } from 'vitest';
import { ContrastLevel, createScheme } from '../src';

describe('ContrastLevel', () => {
  it('finds the closest named contrast helper level', () => {
    expect(ContrastLevel.findClosest(-1.8)).toBe(ContrastLevel.Reduced);
    expect(ContrastLevel.findClosest(-0.8)).toBe(ContrastLevel.Reduced);
    expect(ContrastLevel.findClosest(-0.2)).toBe(ContrastLevel.Default);
    expect(ContrastLevel.findClosest(0.2)).toBe(ContrastLevel.Default);
    expect(ContrastLevel.findClosest(0.4)).toBe(ContrastLevel.Medium);
    expect(ContrastLevel.findClosest(0.74)).toBe(ContrastLevel.Medium);
    expect(ContrastLevel.findClosest(0.9)).toBe(ContrastLevel.High);
    expect(ContrastLevel.findClosest(1.8)).toBe(ContrastLevel.High);
  });

  it('maps numeric from input to a named helper without relaxing raw contrast validation', () => {
    expect(ContrastLevel.from(0.4)).toBe(ContrastLevel.Medium);
    expect(ContrastLevel.from(1.1)).toBe(ContrastLevel.High);

    expect(() => createScheme('#6750a4', { contrastLevel: 1.1 })).toThrow(
      /contrastLevel must be a finite number between -1 and 1/,
    );
  });
});
