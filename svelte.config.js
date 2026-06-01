import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from "svelte-preprocess";
import autoprefixer from "autoprefixer";

const dev = process.argv.includes('dev');

const preprocess = sveltePreprocess({
	postcss: {
		plugins: [autoprefixer]
	}
});

export default {
	preprocess,

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html'
		}),

		paths: {
			base: dev ? '' : '/ProtestInjunction'
		}
	}
};