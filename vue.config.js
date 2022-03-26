const BundleAnalyzerPlugin = require('webpack-visualizer-plugin');

module.exports = {
  devServer: {
    proxy: 'https://photon.komoot.io'
  },

  transpileDependencies: [
    'vuetify'
  ],

  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()]
  }
}

