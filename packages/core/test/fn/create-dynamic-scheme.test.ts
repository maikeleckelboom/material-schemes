import {beforeEach, describe, expect, it, vi} from "vitest";
import type {ExtendedColor} from "../../src";
import {createExtendedColor} from "../../src";

// Mock dependencies
vi.mock("../../src/utils/blend", () => ({
  harmonize: vi.fn().mockReturnValue(0xff00ee)
}));

vi.mock("../../src/theme", () => {
  const mockTonalPalette = {
    tone: vi.fn((tone) => tone)
  };

  const getPaletteForName = (name: string) => {
    // Only provide palettes for these specific names
    const validNames = ["primary", "secondary", "tertiary", "neutral",
      "neutralVariant", "error", "test", "super"];
    // Convert camelCase to kebab-case for comparison
    const normalizedName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    // Check if the normalized name matches any valid names
    const matchedName = validNames.find(validName =>
      normalizedName === validName || normalizedName.startsWith(validName + "-"));
    // Return the mock palette if a match is found
    return matchedName ? mockTonalPalette : null;
  };

  return {
    MaterialDynamicScheme: vi.fn().mockImplementation((sourceColor) => ({
      primaryPalette: getPaletteForName("primary"),
      secondaryPalette: getPaletteForName("secondary"),
      tertiaryPalette: getPaletteForName("tertiary"),
      neutralPalette: getPaletteForName("neutral"),
      neutralVariantPalette: getPaletteForName("neutralVariant"),
      errorPalette: getPaletteForName("error")
    }))
  };
});

describe("createExtendedColor", () => {
  const sourceColor = 0x6200ee;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully create an extended color for 'test'", () => {
    const testColor: ExtendedColor = {
      name: "test",
      value: 0xff0000,
      blend: false
    };

    const result = createExtendedColor(sourceColor, testColor);

    expect(result).toHaveProperty("value");
    expect(result).toHaveProperty("light");
    expect(result).toHaveProperty("dark");
    expect(result.light).toHaveProperty("test");
    expect(result.light).toHaveProperty("onTest");
  });


  it("should handle multi-word color names that match valid palettes", () => {
    const validMultiWordColor: ExtendedColor = {
      name: "super hero",
      value: 0x0000ff,
      blend: true
    };

    const result = createExtendedColor(sourceColor, validMultiWordColor);

    expect(result.light).toHaveProperty("superHero");
    expect(result.light).toHaveProperty("onSuperHero");
    expect(result.light).toHaveProperty("superHeroContainer");
  });
});
