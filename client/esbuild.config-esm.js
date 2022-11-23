const pkg = require("./package.json");

require("esbuild")
  .build({
    entryPoints: ["src/index.ts"],
    format: "esm",
    bundle: true,
    minify: true,
    outfile: "dist/hyperfov-link-previews.mjs",
    // globalName: "linkPreview",
    banner: {
      js: `/** \n * hyperfov-link-previews.js v${
        pkg.version
      }\n * (c) 2021-${new Date().getFullYear()} Christian Broms\n * MIT License\n */`,
    },
  })
  .catch(() => process.exit(1));
