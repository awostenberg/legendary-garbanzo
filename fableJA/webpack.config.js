// note from John: derived from https://github.com/MangelMaxime/fulma-demo/blob/4f78bde5d333cc76176eaf574a0311efc0e2bb3d/webpack.config.js
// Template for webpack.config.js in Fable projects
// Find latest version in https://github.com/fable-compiler/webpack-config-template

// In most cases, you'll only need to edit the CONFIG object
// See below if you need better fine-tuning of Webpack options

var path = require("path");

function resolve(filePath) {
    return path.resolve(__dirname, filePath)
}

var CONFIG = {
    indexHtmlTemplate: resolve('./index.html'),
    fsharpEntry: resolve('./Program.fs.js'),
    cssEntry: resolve('./main.css'),
    assetsDir: resolve('./assets'),
    devServerPort: 30304,
    // When using webpack-dev-server, you may need to redirect some calls
    // to a external API server. See https://webpack.js.org/configuration/dev-server/#devserver-proxy
    devServerProxy: {
        '/**': {
            // assume dev server is running on :30303
            target: "http://localhost:30303",
            changeOrigin: true
        }
    },
    // Use babel-preset-env to generate JS compatible with most-used browsers.
    // More info at https://github.com/babel/babel/blob/master/packages/babel-preset-env/README.md
    babel: {
        presets: [
            ["@babel/preset-env", {
                "modules": false,
                "useBuiltIns": "usage",
                "corejs": 3,
                // This saves around 4KB in minified bundle (not gzipped)
                // "loose": true,
            }]
        ],
    }
}

var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { config } = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// The HtmlWebpackPlugin allows us to use a template for the index.html page
// and automatically injects <script> or <link> tags for generated bundles.
var commonPlugins = [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: CONFIG.indexHtmlTemplate
    })
];

module.exports = (env, argv) => {
    var isProduction;
    if (argv?.mode) {
        // if --mode is passed into webpack, use the value from that
        isProduction = argv?.mode === "production";
    } else {
        // otherwise, if we're running from the webpack dev server, assume development mode
        var isDevServer = process.env.WEBPACK_SERVE === 'true';
        isProduction = !isDevServer;
    }
    console.log("Bundling for " + (isProduction ? "production" : "development") + "...");

    var outputDir = env.output;
    var resolvedOutputDir = path.resolve(__dirname, outputDir);

    if (isProduction) {
        console.log("Output directory: " + outputDir + "");
        console.log("Resolved output directory: " + resolvedOutputDir);
    }

    return {
        // In development, have two different entries to speed up hot reloading.
        // In production, have a single entry but use mini-css-extract-plugin to move the styles to a separate file.
        entry: isProduction ? {
            app: [CONFIG.fsharpEntry, CONFIG.cssEntry]
        } : {
            app: [CONFIG.fsharpEntry],
            style: [CONFIG.cssEntry]
        },
        // Add a hash to the output file name in production
        // to prevent browser caching if code changes
        output: {
            path: resolvedOutputDir,
            filename: isProduction ? '[name].[fullhash].js' : '[name].js',
            devtoolModuleFilenameTemplate: info =>
                path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
        },
        mode: isProduction ? "production" : "development",
        devtool: isProduction ? "source-map" : "eval-source-map",
        optimization: {
            runtimeChunk: 'single',
            // Split the code coming from npm packages into a different file.
            // 3rd party dependencies change less often, let the browser cache them.
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /node_modules/,
                        name: "vendors",
                        chunks: "all"
                    }
                }
            },
        },
        // Besides the HtmlPlugin, we use the following plugins:
        // PRODUCTION
        //      - MiniCssExtractPlugin: Extracts CSS from bundle to a different file
        //      - CopyWebpackPlugin: Copies static assets to output directory
        // DEVELOPMENT
        //      - HotModuleReplacementPlugin: Enables hot reloading when code changes without refreshing
        plugins: isProduction ?
            commonPlugins.concat([
                new MiniCssExtractPlugin({ filename: 'style.css' }),
                new CopyWebpackPlugin(
                    {
                        patterns: [
                            { from: CONFIG.assetsDir }
                        ]
                    }
                )
            ])
            : commonPlugins.concat([

            ]),
        resolve: {
            // See https://github.com/fable-compiler/Fable/issues/1490
            symlinks: false
        },
        // Configuration for webpack-dev-server
        devServer: {
            port: CONFIG.devServerPort,
            proxy: CONFIG.devServerProxy,
            hot: true,
            static: {
                directory: CONFIG.assetsDir,
            }
        },
        // - babel-loader: transforms JS to old syntax (compatible with old browsers)
        // - sass-loaders: transforms SASS/SCSS into JS
        // - file-loader: Moves files referenced in the code (fonts, images) into output folder
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: CONFIG.babel
                    },
                },
                {
                    test: /\.(sass|scss|css)$/,
                    use: [
                        isProduction
                            ? MiniCssExtractPlugin.loader
                            : 'style-loader',
                        'css-loader',
                        'sass-loader',
                    ],
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/,
                    type: 'asset/resource',
                }
            ]
        }
    }
};
