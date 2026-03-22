import { copyFileSync } from 'node:fs';
import path from 'node:path';

import { defineConfig, type Plugin } from 'vite';

function copyContentCss(): Plugin {
    return {
        name: 'copy-content-css',
        writeBundle() {
            copyFileSync(
                path.resolve(__dirname, 'src/content/content.css'),
                path.resolve(__dirname, 'dist/content.css'),
            );
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [copyContentCss()],
    server: {
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                content: path.resolve(__dirname, 'src/content/index.ts'),
            },
            output: {
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        outDir: 'dist',
    },
});
