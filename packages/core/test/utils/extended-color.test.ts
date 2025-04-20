import {beforeEach, describe, expect, it, vi} from 'vitest';

// Setup mocks
vi.mock('../../src/utils/blend', () => {
  return {
    // Define harmonize directly within the mock factory
    harmonize: vi.fn((sourceColor, targetColor) => {
      // Return a harmonized value when called with parameters
      return 0xff0001; // 16711681 (0xff0001 in hex)
    })
  };
});

// Create mock tonal palette
const mockTonalPalette = {
  tone: vi.fn((tone) => tone), // Return the tone value for easy testing
};

vi.mock('../../src/theme', () => ({
  DynamicColorScheme: vi.fn().mockImplementation(() => ({
    primaryPalette: mockTonalPalette,
    secondaryPalette: mockTonalPalette,
    tertiaryPalette: mockTonalPalette,
    neutralPalette: mockTonalPalette,
    neutralVariantPalette: mockTonalPalette,
    errorPalette: mockTonalPalette,
  }))
}));

import type {ExtendedColor} from '../../src/types/extended-color';
// Now import the modules that were mocked
import {createExtendedColor} from '../../src';
import {harmonize} from '../../src/utils/blend';
import {DynamicColorScheme} from '../../src/theme';

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe('createExtendedColor', () => {
  const sourceColor = 0x6200ee;

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

    // Verify color reference maintains the core properties
    expect(result.color).toMatchObject({
      name: testColor.name,
      value: testColor.value,
      blend: testColor.blend,
    });
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

    // Clear previous calls
    vi.mocked(harmonize).mockClear();

    const result = createExtendedColor(sourceColor, testColor);

    // Our harmonized mock returns 0xff0001
    expect(result.value).toBe(0xff0001);
    expect(harmonize).toHaveBeenCalledWith(sourceColor, testColor.value);
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

    // Clear any previous calls
    vi.mocked(harmonize).mockClear();

    const result = createExtendedColor(sourceColor, testColor);

    // Should use original value
    expect(result.value).toBe(0xff0000);
    // In the actual implementation, harmonize is likely used elsewhere,
    // So we should check it wasn't called with our specific values
    expect(harmonize).not.toHaveBeenCalledWith(sourceColor, testColor.value);
  });

  it('should not harmonize color when blend is undefined', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
    };

    // Clear any previous calls
    vi.mocked(harmonize).mockClear();

    const result = createExtendedColor(sourceColor, testColor);

    // Should use original value
    expect(result.value).toBe(0xff0000);
    // In the actual implementation, harmonize is likely used elsewhere,
    // So we should check it wasn't called with our specific values
    expect(harmonize).not.toHaveBeenCalledWith(sourceColor, testColor.value);
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

  it('should initialize DynamicColorScheme with source color', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
    };

    createExtendedColor(sourceColor, testColor);

    // Verify the source color was passed to DynamicColorScheme
    expect(DynamicColorScheme).toHaveBeenCalledWith(sourceColor);
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

    // Clear previous calls
    vi.mocked(harmonize).mockClear();

    const result = createExtendedColor(sourceColor, testColor);

    // Our harmonized mock returns 0xff0001
    expect(result.value).toBe(0xff0001);
    expect(harmonize).toHaveBeenCalledWith(sourceColor, testColor.value);
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

    // Clear any previous calls
    vi.mocked(harmonize).mockClear();

    const result = createExtendedColor(sourceColor, testColor);

    // Should use original value
    expect(result.value).toBe(0xff0000);
    // In the actual implementation, harmonize is likely used elsewhere,
    // So we should check it wasn't called with our specific values
    expect(harmonize).not.toHaveBeenCalledWith(sourceColor, testColor.value);
  });

  it('should not harmonize color when blend is undefined', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
    };

    // Clear any previous calls
    vi.mocked(harmonize).mockClear();

    const result = createExtendedColor(sourceColor, testColor);

    // Should use original value
    expect(result.value).toBe(0xff0000);
    // In the actual implementation, harmonize is likely used elsewhere,
    // So we should check it wasn't called with our specific values
    expect(harmonize).not.toHaveBeenCalledWith(sourceColor, testColor.value);
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

  it('should initialize DynamicColorScheme with source color', () => {
    const testColor: ExtendedColor = {
      name: 'test color',
      value: 0xff0000,
    };

    createExtendedColor(sourceColor, testColor);

    // Verify the source color was passed to DynamicColorScheme
    expect(DynamicColorScheme).toHaveBeenCalledWith(sourceColor);
  });
});
