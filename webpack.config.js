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
      jQuery: 'jquery',
      // d3: 'd3',
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['react', 'es2015', 'stage-3', 'stage-0'],
          plugins: ['transform-runtime']

        }
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader'
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