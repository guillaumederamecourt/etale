import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const buildId = process.env.GITHUB_SHA?.slice(0, 12) || Date.now().toString(36);

const versionFile = {
  name: 'version-file',
  apply: 'build',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: buildId }) });
  },
};

export default defineConfig({
  base: './',
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [svelte(), versionFile],
});
