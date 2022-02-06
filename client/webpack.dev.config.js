const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "src/index.html", to: "index.html" }],
    }),
  ],
  output: {
    filename: "link-previews.js",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  devServer: {
    compress: true,
    port: 9000,
  },
};
