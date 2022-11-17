import { parse } from "node-html-parser";
import { PreviewContent } from "./types";

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(
    handleRequest(event).catch((err) => {
      return new Response(err.stack, { status: 500 });
    })
  );
});

async function handleRequest(event: FetchEvent) {
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
    const targetProperties = [
      "og:title",
      "og:description",
      "og:image",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "description",
      "title",
    ];

    const res = await fetch(page);

    if (res.ok) {
      const bodyContent = await res.text();
      const parsed = parse(bodyContent);
      const responseContent: PreviewContent = {};

      const meta = parsed.querySelectorAll("meta");
      const title = parsed.querySelector("title");

      const links = parsed.querySelectorAll("link");

      if (title) {
        responseContent["title"] = title.text;
      }

      // get the content of any meta tags we're looking for
      for (const tag of meta) {
        const property =
          tag.getAttribute("property") || tag.getAttribute("name");
        if (property && targetProperties.includes(property)) {
          responseContent[
            property.replace("og:", "").replace("twitter:", "")
          ] = tag.getAttribute("content");
        }
      }

      for (const tag of links) {
        if (tag.getAttribute("rel")?.includes("icon")) {
          responseContent.favicon = tag.getAttribute("href");
        }
      }

      // clean up the description
      if (
        responseContent["description"] &&
        responseContent["description"].length > parseInt(MAX_DESCRIPTION_LENGTH)
      ) {
        responseContent["description"] =
          responseContent["description"].substring(
            0,
            parseInt(MAX_DESCRIPTION_LENGTH)
          ) + "...";
      }

      // add absolute links to any relative images
      if (
        page &&
        responseContent.favicon &&
        !responseContent.favicon.includes("http")
      ) {
        const faviUrl = new URL(page);
        faviUrl.pathname = responseContent.favicon.toString();
        responseContent.favicon = faviUrl.toString();
      }

      if (
        page &&
        responseContent.image &&
        !responseContent.image.includes("http")
      ) {
        const imgUrl = new URL(page);
        imgUrl.pathname = responseContent.image.toString();
        responseContent.image = imgUrl.toString();
      }

      // respond with new data
      response = new Response(JSON.stringify(responseContent), {
        headers: responseHeaders,
      });

      // save the response in the cache if the response was successful
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
