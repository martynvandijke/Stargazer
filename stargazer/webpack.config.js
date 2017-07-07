var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')



const configuration = {};

module.exports = {
  context: __dirname,

  entry: './assets/js/index', // entry point of our app. assets/js/index.js should require other js modules and dependencies it needs

  output: {
    path: path.resolve('./assets/bundles/'),
    filename: "[name]-[hash].js",
  },

  plugins: [
    new BundleTracker({ filename: './webpack-stats.json' }),


  ],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query:
        {
          presets: ['es2015', 'react','stage-0']
        }
      }, // to transform JSX into JS
    ],
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },
  node: {
    fs: 'empty'
  },
  externals: [
    { "./cptable": "var cptable" }
  ]

}
