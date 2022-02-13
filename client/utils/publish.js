const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// publish the package to the hyperfov CDN
const publish = async () => {
  const file = fs
    .readFileSync(path.join(__dirname, "../dist/hyperfov-link-previews.js"))
    .toString();

  const loc = encodeURIComponent(
    `link-previews/${"v0.0.0"}/hyperfov-link-previews.js`
  );

  const params = new URLSearchParams();
  params.append("value", file);
  params.append("metadata", {});

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CF_KV_NAMESPACE}/values/${loc}`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Email": process.env.CF_EMAIL,
        "X-Auth-Key": process.env.CF_API_TOKEN,
      },
      body: params,
    }
  );
  return res.ok;
};

publish();
