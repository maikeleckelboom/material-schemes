import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('source policy', () => {
  it('does not import deprecated Scheme/static theme APIs or package providers', async () => {
    const source = await readSourceFiles('src');

    expect(source).not.toContain('@material/material-color-utilities');
    expect(source).not.toContain('@poupe/material-color-utilities');
    expect(source).not.toMatch(/import\s*\{[^}]*\bScheme\b[^}]*\}/);
    expect(source).not.toMatch(
      /\bScheme\.(light|dark|lightContent|darkContent|lightFromCorePalette|darkFromCorePalette)\b/,
    );
    expect(source).not.toMatch(/\bMaterialDynamicColors\./);
    expect(source).not.toContain('themeFromSourceColor');
    expect(source).not.toContain('applyTheme');
  });

  it('does not retain deleted public API names in the root export', async () => {
    const rootExport = await readFile(join('src', 'index.ts'), 'utf8');

    for (const deletedName of [
      'createTheme',
      'createScheme',
      'createColorScheme',
      'MaterialTheme',
      'DynamicColorScheme',
      'PaletteStyle',
      'Variant',
      'createPalette',
      'getPaletteColors',
      'ContrastLevel',
      'ContrastThreshold',
      'toArgb',
      'toHex',
      'createCssVariables',
      'createSchemeCssVariables',
    ]) {
      expect(rootExport).not.toMatch(new RegExp(`\\b${deletedName}\\b`));
    }
  });
});

async function readSourceFiles(directory: string): Promise<string> {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return readSourceFiles(path);
      if (!entry.name.endsWith('.ts')) return '';
      return readFile(path, 'utf8');
    }),
  );

  return contents.join('\n');
}
