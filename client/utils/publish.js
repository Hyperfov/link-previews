const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// publish the package to the hyperfov CDN
// this is run from the github action
const publish = async () => {
  const jsFile = fs
    .readFileSync(path.join(__dirname, "../dist/hyperfov-link-previews.js"))
    .toString();

  const loc1 = encodeURIComponent(
    `/link-previews/${process.env.TAG}/hyperfov-link-previews.js`
  );

  const res1 = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE}/values/${loc1}`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": process.env.CF_EMAIL,
        "X-Auth-Key": process.env.CF_API_TOKEN,
      },
      body: jsFile,
    }
  );

  const cssFile = fs
    .readFileSync(path.join(__dirname, "../dist/hyperfov-link-previews.css"))
    .toString();

  const loc2 = encodeURIComponent(
    `/link-previews/${process.env.TAG}/hyperfov-link-previews.css`
  );

  const res2 = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE}/values/${loc2}`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": process.env.CF_EMAIL,
        "X-Auth-Key": process.env.CF_API_TOKEN,
      },
      body: cssFile,
    }
  );

  return res1.ok && res2.ok;
};

publish();
