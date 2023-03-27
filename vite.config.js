import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/vite-plugin-vue-i18n';

// https://vitejs.dev/config/
export default defineConfig((/*{ command }*/) => {
    return {
        alias: {
            'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
        },
        plugins: [
            vue(),
            vueI18n({
                include: resolve(dirname(fileURLToPath(import.meta.url)), './path/to/src/locales/**')
            })
        ],
        // base: command === 'serve' ? '' : '/goal-vue/',
        base: '',
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    };
});
