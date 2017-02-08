var webpack = require('webpack')
var path = require('path')

module.exports = {
  devtool: 'eval',
  entry: {
    bundle: path.join(__dirname, '/src/index.js'),
  },
  output: {
    path: path.join(__dirname, '/'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['react', 'es2015', 'stage-3']
        }
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.html$/,
        loader: 'html-loader',
      }
    ]
  },
  devServer: {
    contentBase: '.',
    watchContentBase: true,
    publicPath: '/',
    compress: true,
    hot: true,
    inline: true,
    port: 8080
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }

}