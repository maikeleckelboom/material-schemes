import {describe, beforeEach, it, expect, vi} from "vitest";
import {createDynamicScheme} from "../../src/fn/create-dynamic-scheme";
import {MaterialDynamicScheme} from "../../src/theme";
import * as utils from "../../src/utils";

// Mock the isColor function and MaterialDynamicScheme class
vi.mock("../../src/theme", () => ({
  MaterialDynamicScheme: vi.fn().mockImplementation((source, options) => ({
    source,
    options,
    // Mock method for instanceof checks
    __proto__: {constructor: {name: "MaterialDynamicScheme"}}
  }))
}));

vi.mock("../../src/utils", () => ({
  isColor: vi.fn()
}));

describe("createDynamicScheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create scheme with Color source", () => {
    // Setup
    const mockColor = "#123456";
    vi.mocked(utils.isColor).mockReturnValue(true);
    const mockOptions = {contrastLevel: 0.5};

    // Execute
    const result = createDynamicScheme(mockColor, mockOptions);

    // Verify
    expect(utils.isColor).toHaveBeenCalledWith(mockColor);
    expect(MaterialDynamicScheme).toHaveBeenCalledWith(mockColor, mockOptions);
    expect(result).toEqual({
      source: mockColor,
      options: mockOptions,
      __proto__: {constructor: {name: "MaterialDynamicScheme"}}
    });
  });

  it("should create scheme with DynamicSchemeOptions object", () => {
    // Setup
    const mockOptions = {sourceColor: "#abcdef", isDark: true};
    vi.mocked(utils.isColor).mockReturnValue(false);

    // Execute
    const result = createDynamicScheme(mockOptions);

    // Verify
    expect(utils.isColor).toHaveBeenCalledWith(mockOptions);
    expect(MaterialDynamicScheme).toHaveBeenCalledWith(mockOptions);
    expect(result).toEqual({
      source: mockOptions,
      options: undefined,
      __proto__: {constructor: {name: "MaterialDynamicScheme"}}
    });
  });

  it("should throw error when source is invalid", () => {
    vi.mocked(utils.isColor).mockReturnValue(false);

    expect(() => createDynamicScheme(123)).toThrowError(
      "Invalid argument: source must be a Color or DynamicSchemeOptions"
    );
  });
});
