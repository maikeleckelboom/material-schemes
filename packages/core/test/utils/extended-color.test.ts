import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createExtendedColor, type ExtendedColor} from '../../src/types/extended-color';
import {MaterialDynamicScheme} from '../../src/theme';
import {harmonize} from '../../src/utils';

// Mock dependencies
vi.mock('../../src/utils', () => ({
  harmonize: vi.fn((color, source) => color + 1), // Simple mock implementation
}));

vi.mock('../../src/theme', () => {
  const mockTonalPalette = {
    tone: vi.fn((tone) => tone), // Return the tone value for easy testing
  };

  return {
    MaterialDynamicScheme: vi.fn().mockImplementation(() => ({
      primaryPalette: mockTonalPalette,
    })),
  };
});

describe('createExtendedColor', () => {
  const sourceColor = 0x6200ee;

  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an extended color group with proper structure', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
      blend: false,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Verify structure
    expect(result).toHaveProperty('value');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('palette');
    expect(result).toHaveProperty('light');
    expect(result).toHaveProperty('dark');

    // Verify color reference is maintained
    expect(result.color).toBe(testColor);
  });

  it('should correctly generate light and dark palettes with camelCase keys', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
      blend: false,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Check light palette keys
    expect(result.light).toHaveProperty('testColor');
    expect(result.light).toHaveProperty('onTestColor');
    expect(result.light).toHaveProperty('testColorContainer');
    expect(result.light).toHaveProperty('onTestColorContainer');

    // Check dark palette keys
    expect(result.dark).toHaveProperty('testColor');
    expect(result.dark).toHaveProperty('onTestColor');
    expect(result.dark).toHaveProperty('testColorContainer');
    expect(result.dark).toHaveProperty('onTestColorContainer');
  });

  it('should use correct tone values for light palette', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
      blend: false,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Our mock returns the tone value, so we can check it directly
    expect(result.light.testColor).toBe(40);
    expect(result.light.onTestColor).toBe(100);
    expect(result.light.testColorContainer).toBe(90);
    expect(result.light.onTestColorContainer).toBe(10);
  });

  it('should use correct tone values for dark palette', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
      blend: false,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Our mock returns the tone value, so we can check it directly
    expect(result.dark.testColor).toBe(80);
    expect(result.dark.onTestColor).toBe(20);
    expect(result.dark.testColorContainer).toBe(30);
    expect(result.dark.onTestColorContainer).toBe(90);
  });

  it('should harmonize color when blend is true', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
      blend: true,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Our harmonized mock adds 1 to the color value
    expect(result.value).toBe(0xff0001);
    expect(harmonize).toHaveBeenCalledWith(testColor.value, sourceColor);
  });

  it('should preserve the description property', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
      description: 'A custom color with a description',
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Verify the description is preserved
    expect(result.color.description).toBe('A custom color with a description');
  });

  it('should not harmonize color when blend is false', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
      blend: false,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Should use original value
    expect(result.value).toBe(0xff0000);
    // In the actual implementation, harmonize is likely used elsewhere,
    // So we should check it wasn't called with our specific values
    expect(harmonize).not.toHaveBeenCalledWith(testColor.value, sourceColor);
  });

  it('should not harmonize color when blend is undefined', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Should use original value
    expect(result.value).toBe(0xff0000);
    // In the actual implementation, harmonize is likely used elsewhere,
    // So we should check it wasn't called with our specific values
    expect(harmonize).not.toHaveBeenCalledWith(testColor.value, sourceColor);
  });

  it('should work with multi-word color names', () => {
    const testColor: ExtendedColor = {
      name: 'super iron man',
      value: 0xff0000,
      blend: false,
    };

    const result = createExtendedColor(sourceColor, testColor);

    // Check light palette keys are correctly generated
    expect(result.light).toHaveProperty('superIronMan');
    expect(result.light).toHaveProperty('onSuperIronMan');
    expect(result.light).toHaveProperty('superIronManContainer');
    expect(result.light).toHaveProperty('onSuperIronManContainer');
  });

  it('should initialize MaterialDynamicScheme with source color', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
    };

    createExtendedColor(sourceColor, testColor);

    // Verify the source color was passed to MaterialDynamicScheme
    expect(MaterialDynamicScheme).toHaveBeenCalledWith(sourceColor);
  });
});
