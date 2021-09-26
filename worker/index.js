import { parse } from "node-html-parser";

addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(request) {
  // expect the request to contain ?page={{url to get}}
  const url = new URL(request.url);
  const page = url.searchParams.get("page");

  const targetProperties = ["og:title", "og:description", "og:image"];

  const res = await fetch(page);

  if (res.ok) {
    const bodyContent = await res.text();
    const parsed = parse(bodyContent);
    const responseContent = {};

    const meta = parsed.querySelectorAll("meta");
    const title = parsed.querySelector("title");
    const description = parsed.querySelector("description");

    if (title) {
      responseContent["title"] = title.text;
    }

    if (description) {
      responseContent["description"] = description.text;
    }

    // get the content of any meta tags we're looking for
    for (const tag of meta) {
      const property = tag.getAttribute("property") || tag.getAttribute("name");
      if (targetProperties.includes(property)) {
        responseContent[property.replace("og:", "")] = tag.getAttribute(
          "content"
        );
      }
    }

    const response = new Response(JSON.stringify(responseContent), {
      headers: { "Content-Type": "application/json" },
    });

    return response;
  } else {
    return new Response(JSON.stringify({}), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
