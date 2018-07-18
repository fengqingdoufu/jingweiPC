var webpack = require("webpack");
var ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {

	//页面入口文件配置
	entry: {
		common:"./html/js/common.js"
	},
	output: {
		filename: "[name]-[chunkhash:10].js"
		// filename: "[name].js"
	},
	module: {
	
	},
	plugins: [
		new ManifestPlugin({
			fileName: 'js-manifest.json',
			path: "./js/"
		}),
		new webpack.optimize.UglifyJsPlugin({ // js压缩
	      compress: {
	        warnings: false
	      }
        })
	]
}