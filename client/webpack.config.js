const path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
module.exports = {
    entry: './src/index.tsx',
    mode: process.env.NODE_ENV || 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {test: /\.tsx?$/, loader: "awesome-typescript-loader"},

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {enforce: "pre", test: /\.js$/, loader: "source-map-loader"}
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', ".js", ".json"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: "index.html",
            template: 'src/index.html',
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: process.env.NODE_ENV,
            DOMAIN_API: process.env.DOMAIN_API,
            FACEBOOK_ID: process.env.FACEBOOK_ID,
            VK_ID: process.env.VK_ID,
        }),
    ],
    devServer: {
        public: process.env.DOMAIN_CLIENT,
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 80,
        host: '0.0.0.0',
        disableHostCheck: true,
        historyApiFallback: true
    }
};
