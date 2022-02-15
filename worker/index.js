import { parse } from "node-html-parser";

addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(event) {
  const allowedOrigins = CORS || "*";
  const originAllowed =
    allowedOrigins === "*" ||
    allowedOrigins.indexOf(event.request.headers.get("Origin")) !== -1;

  // cors config
  const responseHeaders = new Headers();
  responseHeaders.set(
    "Access-Control-Allow-Origin",
    originAllowed ? event.request.headers.get("Origin") : null
  );
  responseHeaders.set("Content-Type", "application/json");
  // cache for 10min
  responseHeaders.set("Cache-Control", `s-maxage=${CACHE_DURATION || 6000}`);

  // expect the request to contain ?page={{url to get}}
  const url = new URL(event.request.url);
  const page = url.searchParams.get("page");

  const cacheKey = new Request(url.toString(), event.request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    const targetProperties = ["og:title", "og:description", "og:image"];

    const res = await fetch(page);

    if (res.ok) {
      const bodyContent = await res.text();
      const parsed = parse(bodyContent);
      const responseContent = {};

      const meta = parsed.querySelectorAll("meta");
      const title = parsed.querySelector("title");

      if (title) {
        responseContent["title"] = title.text;
      }

      // get the content of any meta tags we're looking for
      for (const tag of meta) {
        const property =
          tag.getAttribute("property") || tag.getAttribute("name");
        if (targetProperties.includes(property)) {
          responseContent[property.replace("og:", "")] = tag.getAttribute(
            "content"
          );
        }
      }

      // clean up the description
      if (responseContent["description"] && MAX_DESCRIPTION_LENGTH) {
        responseContent["description"] =
          responseContent["description"].substring(0, MAX_DESCRIPTION_LENGTH) +
          "...";
      }

      // respond with new data
      response = new Response(JSON.stringify(responseContent), {
        headers: responseHeaders,
      });

      // save the response in the cache if the response was sucessful
      event.waitUntil(cache.put(cacheKey, response.clone()));
    } else {
      // respond with empty data
      response = new Response(JSON.stringify({}), {
        status: res.status,
        headers: responseHeaders,
      });
    }
  }

  return response;
}
