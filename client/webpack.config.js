const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "src/templates/", to: "templates/" }],
    }),
  ],
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "link-previews.js",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "dist"),
  },
};
