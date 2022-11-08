const path = require("path");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "hyperfov-link-previews.js",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "dist"),
  },
};
