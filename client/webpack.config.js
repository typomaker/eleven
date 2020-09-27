const path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
process.env.TSC_WATCHFILE = "UseFsEventsWithFallbackDynamicPolling"
module.exports = {
    entry: './src/index.tsx',
    mode: process.env.NODE_ENV || 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash:8].js',
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    // disable type checker - we will use it in fork plugin
                    transpileOnly: true
                }
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', ".js", ".json"],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new webpack.HashedModuleIdsPlugin(),
        new HtmlWebpackPlugin({
            hash: false,
            filename: "index.html",
            template: 'src/index.html',
        }),
        new webpack.EnvironmentPlugin(["NODE_ENV", "DOMAIN", "FACEBOOK_ID", "RECAPTHCA2_APP_ID"]),
    ],
    devServer: {
        public: process.env.DOMAIN,
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 80,
        host: '0.0.0.0',
        disableHostCheck: true,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 500,
            poll: 1000,
            ignored: ["/node_modules/", "/dist/", "/.vscode"]
        },
    }
};
