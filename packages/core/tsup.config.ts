import {defineConfig} from 'tsup';

export default defineConfig({
  entry: [
    'src/material-color-utilities.ts',
    'src/index.ts',
  ],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  dts: true
});
