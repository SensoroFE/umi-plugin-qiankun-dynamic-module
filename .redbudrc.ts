import { defineConfig } from 'redbud';

export default defineConfig({
  cjs: {
    transformer: 'babel',
    output: 'lib',
  }
});
