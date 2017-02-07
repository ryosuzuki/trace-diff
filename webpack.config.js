var webpack = require('webpack')
var path = require('path')

module.exports = {
  devtool: 'eval',
  entry: {
    bundle: path.join(__dirname, '/src/index.js'),
  },
  output: {
    path: path.join(__dirname, '/dist'),
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
      }, {
        test: /\.(eot|png|svg|[ot]tf|woff2?)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
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