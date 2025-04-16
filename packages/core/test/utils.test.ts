import {beforeAll, describe, expect, it} from "vitest";
import {generateColorScheme, DynamicColorScheme} from "../src";

let dynamicScheme: DynamicColorScheme

beforeAll(() => {
  dynamicScheme = new DynamicColorScheme(0xFF6200EE);
})

describe('Exposed Utilities', () => {
  it('should be able to use generateColorScheme', () => {
    const colorScheme = generateColorScheme(dynamicScheme, {
      dark: true,
      modifyColorScheme: (colors) => ({
        ...colors,
        accent: colors.primary
      })
    })
    expect(colorScheme).toBeDefined();
    expect(colorScheme.accent).toBe(colorScheme.primary);
  });
})
