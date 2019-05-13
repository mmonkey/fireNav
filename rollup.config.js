import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';

const packageJson = require('./package.json');

const options = {
	input: 'build/js/fireNav.js',
	output: [
		{
			file: 'dist/jquery.fireNav.min.js',
			format: 'iife'
		}
	],
	plugins: [
		buble(),
		commonjs(),
		minify({
			comments: false,
			banner: '/*! ' + packageJson.name + ' (' + packageJson.version + ') (C) 2015 - ' + new Date().getFullYear() + ' ' + packageJson.author + '. MIT @license: en.wikipedia.org/wiki/MIT_License */'
		}),
	]
};

export default options;