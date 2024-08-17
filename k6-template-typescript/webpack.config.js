const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const GlobEntries = require('webpack-glob-entries');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const FileListPlugin = require('file-list-plugin');



module.exports = {
  mode: 'production',
  entry: GlobEntries('./src/*test*.ts'), // Generates multiple entry for each test
  output: {
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      //os: require.resolve('os-browserify/browser'),
      //https: require.resolve("https-browserify"),
      //http: require.resolve("stream-http"),
      //zlib: require.resolve("browserify-zlib"),
      //path: require.resolve("path-browserify"),
      //util: require.resolve("util/"),
      //buffer: require.resolve("buffer/"),
      //url: require.resolve("url/"),
      //assert: require.resolve("assert/"),
      //stream: require.resolve("stream-browserify"),
      //fs: require.resolve("file-system")
      //fs: require.resolve("fs")
      //crypto: require.resolve("k6/crypto")
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  target: 'web',
  externals: /^(k6|https?\:\/\/)(\/.*)?/,
  // Generate map files for compiled scripts
  devtool: "source-map",
  stats: {
    colors: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    // Copy assets to the destination folder
    // see `src/post-file-test.ts` for an test example using an asset
    new CopyPlugin({
      patterns: [{ 
        from: path.resolve(__dirname, 'assets'), 
        noErrorOnMissing: true 
      }],
    }),
	// new WebpackShellPluginNext({
  //     onBuildStart:{
  //       scripts: ['echo "===> Starting packing with WEBPACK"'],
  //       blocking: true,
  //       parallel: false
  //     },
  //     onBuildEnd:{
  //       scripts: ['dist\\k6-run-script.bat'],
  //       blocking: false,
  //       parallel: true
  //     }
  //   }),
	new FileListPlugin({
		fileName: 'k6-run-script.bat',
		format: function defaultFormat(listItems){
			var str = ""
			for(index in listItems) {
				if(listItems[index].match('\.test\.js$')) {
					str += ('k6 run dist/' + listItems[index] + ' >> dist/' + listItems[index] + '.log\r\n')
				}
			}
			return str
		}		
	})
  ],
  optimization: {
    // Don't minimize, as it's not used in the browser
    minimize: false,
  },
};
