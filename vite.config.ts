import { copyFileSync } from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react';
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
    plugins: [react(), copyContentCss()],
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
                popup: path.resolve(__dirname, 'popup.html'),
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
