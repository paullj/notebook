import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	build: {
		target: "es2022",
	},
	optimizeDeps: {
		esbuildOptions: {
			target: "es2022",
		},
	},
	plugins: [sveltekit(), tailwindcss()]
});
