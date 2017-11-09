const webpack = require("webpack")
const path = require("path")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

const BUILD = path.resolve(__dirname, 'static/')
const SRC = path.resolve(__dirname, 'src/client/')

let config = {
	entry: [path.resolve(SRC, 'jsx/index.jsx'), path.resolve(SRC, 'scss/main.scss')],
	output: {
		path: path.resolve(BUILD),
		filename: 'bundle.js',
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.jsx?/,
				include: path.resolve(SRC, 'jsx/'),
				loader: 'babel-loader',
			},
			{
				test: /\.scss$/,
				include: path.resolve(SRC, 'scss/'),
				use: ExtractTextPlugin.extract(["css-loader", "sass-loader"])
			}
		]
	},
	plugins: [
		new ExtractTextPlugin({
			filename: 'bundle.css',
			allChunks: true
		})
	]
}

module.exports = config
