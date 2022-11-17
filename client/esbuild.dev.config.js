const { build } = require("esbuild");

build({
  entryPoints: ["src/index.ts"],
  globalName: "linkPreview",
  // and more options ...
});
