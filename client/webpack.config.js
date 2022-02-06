const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "link-previews.js",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "dist"),
  },
};
