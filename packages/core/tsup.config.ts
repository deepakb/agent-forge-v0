import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  sourcemap: true,
  clean: false,
  treeshake: true,
  splitting: false,
  minify: false,
  bundle: true,
  skipNodeModulesBundle: true,
  target: 'es2020',
  outDir: 'dist',
  tsconfig: 'tsconfig.json',
  onSuccess: 'tsc --emitDeclarationOnly',
});
