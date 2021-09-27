# Link Previews

Link previews everywhere.

When added to a webpage, hovering links displays a wikipedia-style dynamic page preview.

## Usage

There are two parts to this project:

- A script that inserts page previews on your webpage, written as a Svelte web component.
- A serverless worker function that fetches and serves the links' meta information.

The worker is required because CORs prevents cross-origin client requests. For example, trying to directly `fetch` a url like `https://matrix.org` from your webpage will fail since most servers are configured to reject cross-origin requests. As a result, it's necessary to make the request outside the browser.

Since the task of fetching a page and parsing out the meta information is so simple, it can be accomplished with a single serverless function that's very quick to deploy. I'm using [Cloudflare Workers](https://workers.cloudflare.com/) but you could probably rewrite it for some other service like AWS Lambda.

### Deploy the worker

Follow the instructions in [the worker's readme](worker/README.md). Once complete, you should have a url like `https://worker.[something].workers.dev`, or a custom domain if you've opted to set one up.

### Add the script to your website

Import the script from [`/dist/index.js`](dist/index.js) at the end of your site's `body`, then call `setPagePreviews` to instantiate:

```html
<script defer>
  import("../dist/index.js").then(() => {
    setPagePreviews({ workerUrl: "https://worker.[something].workers.dev" });
  });
</script>
```

The default installation will add page previews to all `a` tags on the page.

### Configuration

`setPagePreviews` accepts an object of options:

```
{
    workerUrl: String, // the url of your deployed worker
    styles: CSSStyleSheet, // a stylesheet containing custom popover styles, see below
}

```

#### Styles

By passing in `styles` in the options, you're able to override the default popover styles. Any of the classes in [`src/Interior.svelte`](src/Interior.svelte) and [`src/Wrapper.svelte`](src/Wrapper.svelte) that start with `.hyperfov-` can be overridden. For example, you might change the color of the urls displayed in the popovers:

```html
<style>
  .hyperfov-link-url {
    color: coral;
  }
</style>
```

The passed styles must be a [`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet), which can be selected with `document.styleSheets`, for example:

```html
<script defer>
  import("../dist/index.js").then(() => {
    setPagePreviews({
      workerUrl: "https://worker.[something].workers.dev",
      styles: document.styleSheets[0],
    });
  });
</script>
```

For a concrete example, see [`test/index.html`](test/index.html).
