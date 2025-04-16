import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],     // Entry point of your package.
  outDir: 'dist',              // Output folder.
  format: ['esm', 'cjs'],      // Build both ES Modules and CommonJS.
  sourcemap: true,             // Generate sourcemaps (useful during development).
  clean: true,                 // Clean the output directory before each build.
  dts: true,                   // Generate TypeScript declaration files.
  external: [],
});
