import resolve from '@rollup/plugin-node-resolve';
import rimraf from 'rimraf';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import { version as APP_VERSION } from "./package.json";
import renderEJS from "./utils/plugin-create-ejs";
import injectionPlugin from './utils/plugin-injections';
import copy from 'rollup-plugin-copy';
import { EVERYONE_FIELDS, FILTERS, IS_ADMIN } from "./meta.json";
import handle_css from './utils/plugin-minify-css';

const production = !process.env.ROLLUP_WATCH;

// Clear public folder
rimraf.sync("public")

const GLOBAL_DATA = {
	"APP_VERSION": APP_VERSION,
	"EVERYONE_FIELDS": EVERYONE_FIELDS,
	"FILTERS": FILTERS,
	"IS_ADMIN": IS_ADMIN,
	"IS_DEV": !production
}

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default [
	// JS Files (Also handles CSS Files)
	{
		input: [
			"src/search.js",
			"src/index.js"
		],
		output: {
			format: 'cjs',
			dir: "public",
			entryFileNames: "[name].js",
		},
		plugins: [
			injectionPlugin({
				...GLOBAL_DATA
			}),
		
			// Minify CSS Files
			handle_css({
				"index.css": [
					"src/css/basic.css",
					"src/css/presets.css",
					"src/css/custom.css",
					"src/css/index-main.css",
					"src/css/index-features.css",
				],
				"search.css": [
					"src/css/basic.css",
					"src/css/presets.css",
					"src/css/custom.css",
					"src/css/search.css",
					"src/css/settings-tab.css",
					"src/css/main-tab.css",
					"src/css/search-results.css"
				]
			}),

			// Generate index.html
			renderEJS({
				...GLOBAL_DATA
			}, "src/search.ejs", "src/index.ejs"),
		
			// Copy images and everyone.json
			copy({
				targets: [
					{ src: 'src/static/', dest: 'public/' },
					{ src: 'src/root/*', dest: 'public/' },
					{ src: 'src/everyone.json', dest: 'public/' },
					{ src: 'src/everyone/', dest: 'public/' },
				]
			}),
			
			resolve({ browser: true, }),

			!production && serve(),
			!production && livereload('public'),
			production && terser(),
		],
		watch: {
			clearScreen: false
		}
	},
	// Service Worker
	{
		input: {
			"service-worker": "src/service-worker.js",
		},
		output: {
			format: "cjs",
			dir: "public"
		},
		plugins: [
			production && terser(),
			injectionPlugin({
				...GLOBAL_DATA
			}),
		 ],
		watch: { clearScreen: false }
	},
]