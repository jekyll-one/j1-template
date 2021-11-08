// -----------------------------------------------------------------------------
// ~/packages/200_template_js/wp4_configs/webpack.develop.js
// Webpack development config (dev-server v4) for J1 Template
//
// Product/Info:
// https://jekyll.one
//
// Copyright (C) 2021 Juergen Adams
//
// J1 Template is licensed under the MIT License.
// See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
// -----------------------------------------------------------------------------
// NOTE:
//   Webpack commandline|s
//
//   hot: webpack-dev-server --mode development --config wp4_configs/webpack.develop.js --progress
//   hot: webpack-dev-server --mode development --config wp4_configs/webpack.develop.js
// -----------------------------------------------------------------------------
// webpack-dev-server migration v3 --> v4:
//    https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md
//    https://github.com/webpack/webpack-dev-middleware
//
// -----------------------------------------------------------------------------

// Global WP config variables
// -----------------------------------------------------------------------------
const ROOT =                            '../';
const path =                            require('path');

const webpack =                         require('webpack');
const { merge } =                       require('webpack-merge');
const common =                          require('./webpack.common.js');

// Check if WP is running in a Docker container (environment var J1DOCKER)
// to adjust devServerHost and devServerPageOpen
//
const dockerEnv =                       process.env.J1DOCKER || false;

// Host Check security setting. Set environment var DISABLE_HOST_CHECK
// to 'true' to disable host checking if the development is done on
// a 'remote' host or the development system is e.g. behind a Proxy.
//
//const hostCheck =                     !!JSON.parse(String(process.env.DISABLE_WP_HOST_CHECK).toLowerCase());
const hostCheckDisabled =               !!"String(process.env.DISABLE_WP_HOST_CHECK).toLowerCase()" || false;

// WP Development Server config variables
// -----------------------------------------------------------------------------
const devServerHost =                   dockerEnv ? '0.0.0.0' : 'localhost';
const devServerPageOpen =               dockerEnv ? false : true;
const devServerPort =                   process.env.JEKYLL_PORT || 44000;
const distFolder =                      path.resolve(__dirname, './dist');
const nodeModulesFolder =               path.resolve(__dirname, './node_modules');
// const jekyllSite =                   path.join(__dirname, ROOT, '../400_template_site/_site');
const jekyllSite =                      path.resolve(__dirname, ROOT, '../400_template_site/_site');
const jekyllSiteAssets =                path.join(__dirname, ROOT, '../400_template_site/_site/assets');


// WP PLUGIN definitions
// -----------------------------------------------------------------------------

// Load|Configure NamedModulesPlugin
// -----------------------------------------------------------------------------
const namedModules =                    new webpack.NamedModulesPlugin();

// Load HMR Plugin (Hot-reload for development mode)
// -----------------------------------------------------------------------------
// NOTE
//    For details on HMR, see:
//    https://webpack.js.org/guides/hot-module-replacement/
//    https://webpack.js.org/concepts/hot-module-replacement/
// -------------------------------------------------------------------
const hotModuleReplacement =            new webpack.HotModuleReplacementPlugin();


// WP MODULE definitions
// https://webpack.js.org/guides/production/
// -----------------------------------------------------------------------------
module.exports = merge(common, {

  // GLOBALS
  // ---------------------------------------------------------------------------
  mode:                                 'development',                        // NOTE: force the mode configured (like CLI option --mode)
  stats:                                'errors-only',                        // NOTE: default: normal, can be normal|errors-only|minimal|verbose|none

  // RULES and LOADERS
  // ---------------------------------------------------------------------------
  module: {
  },

  // PLUGIN declarations for export
  // v4 automatically apply HotModuleReplacementPlugin plugin when set hot: true
  // ---------------------------------------------------------------------------
  plugins: [
//  hotModuleReplacement,
    namedModules
  ],

  // WP DEVELOPMENT SERVER configuration
  // ---------------------------------------------------------------------------
  // Used for npm script *develop*  for *hot reload*.
  // See values|var with *Global config variables*.
  //
  // NOTE: Response header settings for the STATIC web (includes CORS if needed)
  // headers:
  //   'Access-Control-Allow-Origin':     '*'
  //   'Access-Control-Allow-Methods':    'GET, POST'                           // Note: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  //   'Access-Control-Allow-Headers':    'Content-Type'                        // Note: 'Authorization, X-Requested-With, Content-Type'
  //   'X-Builder-Engine-By':             'J1 Template'
  // ---------------------------------------------------------------------------
  // NOTE
  //    option --inline adds webpack-dev-server/client?<webpack-dev-server url>
  //    to all entry points.
  // ---------------------------------------------------------------------------
  devServer: {
    host:                               devServerHost,                          // "local-ip"
    port:                               devServerPort,
    allowedHosts:                       "all",                                  // NOTE: host security setting. Only use it when you know what you're doing.
    headers: {                                                                  // NOTE: Response header settings for the STATIC web (CORS)
      'X-Builder-Engine-Powered-By':    'J1 Template'
    },
//  noInfo:                             false,                                  // NOTE: default: false, can be true|false
//  clientLogLevel:                     "error",                                // NOTE: default: info, can be error|warning|info|none
    client: {
      logging: "info",                                                          // NOTE: default: info, can be error|warning|info|none
      // Can be used only for `errors`|`warnings`
      // overlay: {
      //   errors: true,
      //   warnings: true,
      // }
      overlay: true,
      progress: true,
    },
//  stats:                              "minimal",                              // NOTE: default: normal, can be normal|errors-only|minimal|verbose|none
    devMiddleware: {
      index:                            true,                                   // the server will respond to requests to the root URL
      stats:                            "minimal",                              // NOTE: default: normal, can be normal|errors-only|minimal|verbose|none
    },
    static: {
      directory:                            jekyllSite,                         // NOTE: serve Jekyll Site
      staticOptions: {
        watchContentBase:                   true,                               // NOTE: livereload for Jekyll build mode
        watchOptions:                       {
                                              ignored: [
                                                distFolder,                     // NOTE: do not watch for changes on dist folder, node modules
                                                nodeModulesFolder,              // NOTE: do not watch for changes on node modules folder
                                                jekyllSiteAssets                // NOTE: do not watch for changes on _site/assets folder
                                              ],
                                              aggregateTimeout: 300,
                                              poll:            1000
                                            },
      },
      // Don't be confused with `devMiddleware.publicPath`, it is `publicPath` for static directory
      // Can be:
      // publicPath: ['/static-public-path-one/', '/static-public-path-two/'],
      // publicPath: "/static-public-path/",
      // Can be:
      // serveIndex: {} (options for the `serveIndex` option you can find https://github.com/expressjs/serve-index)
      serveIndex: true,
      // Can be:
      // watch: {} (options for the `watch` option you can find https://github.com/paulmillr/chokidar)
      watch: true,
    },
    hot:                                true,                                   // NOTE: enable HMR (Hot Module Replacement)
    open:                               devServerPageOpen                       // NOTE: open a web browser automatically
  }

});  // end module.exports|merge
