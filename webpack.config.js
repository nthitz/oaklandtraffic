var path = require("path");
var webpack = require('webpack')
// var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './client/index.js',
  // resolve: {
  //   root: [path.join(__dirname, "bower_components")]
  // },

  output: {
    filename: 'index.js',
    path: __dirname + '/public',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          // https://github.com/babel/babel-loader#options
          cacheDirectory: true,
          presets: ['es2015', 'react']
        }
      },
      { test: /\.js$/, exclude: /node_modules|bower_components/, loader: 'babel-loader' },
      { test: /\.jsx$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.png$/, loader: "url-loader?limit=100000" },
      { test: /\.jpg$/, loader: "file-loader" },
      {
        test: /\.sass$/,
        loaders: [
          "style",
          "css",
          "autoprefixer?browsers=last 2 version",
          "sass?indentedSyntax",
        ],
      },
      {
        test: /\.css$/,
        loaders: [
          "style",
          "css",
          "autoprefixer?browsers=last 2 version",
        ],
      },

    ],
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    // new HtmlWebpackPlugin({
    //   title: 'mashupfm',
    //   template: './app/html/index.html',
    //   filename: 'index.html'
    // })

    // new webpack.ResolverPlugin(
    //   new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    // )
  ],

}
