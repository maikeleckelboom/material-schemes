import {beforeAll, describe, expect, it} from "vitest";
import {createColorScheme, MaterialDynamicScheme} from "../../src";

let dynamicScheme: MaterialDynamicScheme

beforeAll(() => {
  dynamicScheme = new MaterialDynamicScheme(0xFF6200EE);
})

describe('Exposed Utilities', () => {
  it('should be able to use createColorScheme', () => {
    const colorScheme = createColorScheme(dynamicScheme, {
      modifyColorScheme: (colors) => ({
        ...colors,
        accent: colors.primary
      })
    })
    expect(colorScheme).toBeDefined();
    expect(colorScheme.accent).toBe(colorScheme.primary);
  });
})
