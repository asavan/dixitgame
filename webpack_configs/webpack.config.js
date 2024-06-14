import os from "os";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";

const getLocalExternalIP = () => [].concat(...Object.values(os.networkInterfaces()))
    .filter(details => (details.family === "IPv4" || details.family === 4) &&
        !details.internal && details.netmask == "255.255.255.0")
    .pop()?.address;

const devConfig = () => {
    console.log(getLocalExternalIP());
    const addr = "0.0.0.0";
    return {
        entry: {main: ["./src/index.js", "./src/css/style.css"]},
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, {
                        loader: "css-loader",
                        options: {
                            url: false
                        }
                    }],
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: false,
            }),
            new MiniCssExtractPlugin({
                filename: "[name].css"
            }),
            new webpack.DefinePlugin({
                __USE_SERVICE_WORKERS__: false,
                __USE_DEBUG_ASSERT__: true
            }),
            new CopyPlugin({
                patterns: [
                    { from: "./src/images", to: "./images" },
                    { from: "./src/manifest.json", to: "./" },
                    { from: "./.well-known", to: "./.well-known" }
                ],
            })
        ],
        devServer: {
            compress: true,
            port: 8080,
            hot: true,
            open: true,
            host: addr
        }
    };
};

export default devConfig;
