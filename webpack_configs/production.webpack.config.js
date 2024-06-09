import path from "path";
import { fileURLToPath } from "url";

import HtmlWebpackPlugin from "html-webpack-plugin";
import HTMLInlineCSSWebpackPlugin from "html-inline-css-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserJSPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import {InjectManifest} from "workbox-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";

// import PACKAGE from "../package.json" with { type: "json" };
import { createRequire } from "module";
const PACKAGE = createRequire(import.meta.url)("../package.json");

const prodConfig = () => {
    console.log(PACKAGE.version);
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    return {

        entry: {main: ["./src/index.js", "./src/css/style.css"]},
        output: {
            path: path.resolve(dirname, "../docs"),
            filename: "[name].[contenthash].js",
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [{
                        loader: MiniCssExtractPlugin.loader
                    }, "css-loader"],
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                __USE_SERVICE_WORKERS__: true,
                __USE_DEBUG_ASSERT__: false,
                __SERVICE_WORKER_VERSION__: JSON.stringify(PACKAGE.version)
            }),
            new MiniCssExtractPlugin({
                filename: "[name].[contenthash].css"
            }),
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: false
            }),
            new HTMLInlineCSSWebpackPlugin.default(),
            new InjectManifest({
                swDest: "sw.js",
                swSrc: "./src/sw.js",
                exclude: [
                    /index\.html$/,
                    /CNAME$/,
                    /\.nojekyll$/,
                    /_config\.yml$/,
                    /^.*well-known\/.*$/,
                ]
            }),
            new CopyPlugin({
                patterns: [
                    { from: "./src/images", to: "./images" },
                    { from: "./github", to: "./" },
                    { from: "./src/manifest.json", to: "./" },
                    { from: "./.well-known", to: "./.well-known" }
                ],
            })
        ],
        optimization: {
            minimizer: [new TerserJSPlugin({
                terserOptions: {
                    mangle: true,
                    ecma: 2022,
                    compress: {
                        unsafe: true,
                        unsafe_math: true,
                        unsafe_arrows: true,
                        drop_console: true,
                        pure_new: true,
                        passes: 2,
                        keep_fargs: false,
                        pure_funcs: [
                            "assert", "localAssert"
                        ],
                    }
                }
            }), new CssMinimizerPlugin()],
        }
    };
};

export default prodConfig;
