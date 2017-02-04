var webpack = require('webpack')
var path = require('path')

module.exports = {
  devtool: 'eval',
  entry: {
    bundle: './src/index.js',
  },
  output: {
    path: path.join(__dirname, '/public'),
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    // new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
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
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
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