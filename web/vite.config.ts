import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function classicScripts(): Plugin {
  return {
    name: 'classic-scripts',
    enforce: 'post',
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin/g, '<script defer')
        .replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet"');
    },
  };
}

export default defineConfig(({ mode }) => {
  const isFile = mode === 'file';
  return {
    base: isFile ? './' : '/',
    plugins: [react(), ...(isFile ? [classicScripts()] : [])],
    server: { proxy: { '/api': 'http://localhost:3100' } },
    build: isFile
      ? {
          outDir: 'dist-file',
          rollupOptions: { output: { format: 'iife' } },
        }
      : {},
  };
});
