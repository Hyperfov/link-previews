const { dependencies, version } = require("../package.json");
const { build } = require("esbuild");
const { Generator } = require("npm-dts");

// generate types
new Generator({
  entry: "src/index.ts",
  output: "dist/index.d.ts",
}).generate();

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  banner: {
    js: `/** \n * hyperfov-link-previews.js v${version}\n * (c) 2021-${new Date().getFullYear()} Christian Broms\n * MIT License\n */`,
  },
};

// esm version
build({
  ...sharedConfig,
  format: "esm",
  outfile: "dist/index.mjs",
  external: Object.keys(dependencies),
}).catch(() => process.exit(1));

// iife version
build({
  ...sharedConfig,
  format: "iife",
  outfile: "dist/index.js",
}).catch(() => process.exit(1));
