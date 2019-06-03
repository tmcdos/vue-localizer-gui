'use strict' 
const path = require('path');
const fs = require('fs');

module.exports = 
{
  publicPath: './',  
  devServer: 
  {
    host: '0.0.0.0',
    disableHostCheck: true,
    proxy: 
    {
      '/api': 
      {
        target: 'https://www.nameisp.com',
        ws: true,
        changeOrigin: true
      },
    },
    overlay:
    {
      errors: true,
      warnings: true
    },
    clientLogLevel: 'info',
  },
  css:
  {
    sourceMap: process.env.NODE_ENV === 'development',
    loaderOptions:
    {
      postcss:
      {
        config:
        {
          // without this Webpack complains that there is no PostCSS config inside the Vuetify/dist folder
          path: path.resolve(__dirname, '.postcssrc.js'),
        }
      }
    }    
  },
  productionSourceMap: false,
  configureWebpack: (config) => { 
    let parent, dir = path.resolve(__dirname);
    const parsed = path.parse(dir);
    while(parsed.root !== dir)
    {
      dir = path.dirname(dir);
      parent = dir + (parsed.root != dir ? path.sep : '') + 'node_modules';
      config.resolve.modules.push(parent);
      config.resolveLoader.modules.push(parent);
    }
    
    config.devtool = 'inline-source-map'; // other modes often break hot-reload and/or breakpoints
  },
  chainWebpack: config => 
  {
    config.resolve.symlinks(true);
    config.module
      .rule("i18n")
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use("i18n")
        .loader("@kazupon/vue-i18n-loader")
        .end();
    config.module.rule('eslint').use('eslint-loader').loader('eslint-loader').tap(options =>
    {
      options.cache = false; // otherwise on each restart cached errors won't be shown !!!
      return options;
    });
    // plugin options must be wrapped inside Array - otherwise error "non-callable @@iterator"
    config.plugin('stylelintVue')
      .use(require('stylelint-webpack-plugin'),
      [
        {
          context: path.resolve(__dirname, 'src'),
          files: ['**/*.vue','**/*.css','**/*.scss'],
          globbyOptions: {extension: false}, // IVO GELOV - otherwise "fastGlob" does not find anything if the folder contains brace(s)
          quiet: false, 
          emitErrors: false  
        }
      ]);
    if(process.env.NODE_ENV === 'production')
    {
      const zopfli = require("@gfx/zopfli");
      const compressionTest = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

      config.plugin('assetGzip').use(require("compression-webpack-plugin"),
      [{
        algorithm(input, compressionOptions, callback) 
        {
          return zopfli.gzip(input, compressionOptions, callback);
        },
        compressionOptions: 
        {
          numiterations: 15
        },
        minRatio: 0.99,
        test: compressionTest
      }]);
      config.plugin('assetBrotli').use(require("brotli-webpack-plugin"),
      [{
        test: compressionTest,
        minRatio: 0.99
      }]);      
    }
    return config;
  }
}