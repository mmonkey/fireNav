/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */
module.exports = {
	ui: false,
	files: ['build/**/*.*'],
	watchEvents: [
		'change'
	],
	watch: false,
	ignore: [
		'node_modules/**/*.*'
	],
	single: false,
	watchOptions: {
		ignoreInitial: true
	},
	server: './build',
	serveStatic: [{
		route: '/dist',
		dir: 'dist'
	}],
	port: 8888,
	online: false,
	open: false
};