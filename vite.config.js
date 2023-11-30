import { sveltekit } from '@sveltejs/kit/vite';
import unoCSS from 'unocss/vite'
import extractorSvelte from '@unocss/extractor-svelte'

/** @type {import('vite').Plugin} */
const viteServerConfig = {
    name: 'add headers',
    configureServer: (server) => {
        server.middlewares.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            next();
        });
    }
};

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		unoCSS({
			extractors: [
				extractorSvelte(),
			],
		}),
		sveltekit(),
		viteServerConfig
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	worker: {
		format: 'es'
	},
};

export default config;
