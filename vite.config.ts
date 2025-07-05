import tailwindcss from "@tailwindcss/vite";
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), devtoolsJson(), nodePolyfills()]
});
