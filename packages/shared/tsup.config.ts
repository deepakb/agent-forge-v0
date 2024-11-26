import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: true,
  treeshake: true,
  tsconfig: './tsconfig.json',
  outDir: 'dist',
});
