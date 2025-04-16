import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  dts: true,
  external: [],
  noExternal: ['@material/material-color-utilities'],
  // TODO future usage:
  //      import {TonalPalette} from "@chromavert/material/material-color-utilities";
});
