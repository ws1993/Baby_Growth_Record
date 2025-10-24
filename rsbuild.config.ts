import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [pluginVue()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  html: {
    template: './src/index.html',
  },
  performance: {
    transformRemoveConsole: process.env.NODE_ENV === 'production',
  },
});
