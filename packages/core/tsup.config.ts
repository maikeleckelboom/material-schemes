import {defineConfig} from 'tsup';

export default defineConfig({
  entry: [
    'src/material-color-utilities.ts',   // The new entry point for the sub-path
    'src/index.ts',                     // Your main entry point
    //  'src/utils/index.ts',               // The new entry point for the utils sub-path
    //  'src/types/index.ts',               // The new entry point for the types' sub-path
  ],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  dts: true,
});
