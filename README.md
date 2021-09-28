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
    workerUrl: String,
    styles: CSSStyleSheet,      // optional
    getLinks: Function,         // optional
    assignStyles: Function,     // optional
    assignPositions: Function,  // optional
}

```

Each option is explained in more depth below:

### `workerUrl`

---

**Required**. The url of your deployed worker. See [deploy the worker](#deploy-the-worker) for how to deploy.

### `styles`

---

**Optional**. A stylesheet containing rules for styling the popover.

By passing in `styles` in the options, you're able to override the default popover styles. Any of the classes in [`src/Interior.svelte`](src/Interior.svelte) and [`src/Wrapper.svelte`](src/Wrapper.svelte) that start with `.hyperfov-` can be overridden. For example, you might change the color of the urls displayed in the popovers:

```html
<style id="popover-styles">
  .hyperfov-link-url {
    color: coral;
  }
</style>
```

The passed styles must be a [`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet). For example:

```js
setPagePreviews({
  workerUrl: "https://...",
  styles: document.getElementById("popover-styles").sheet,
});
```

To apply different styles depending on the link type, see [`assignStyles`](#assignstyles)

### `getLinks`

---

**Optional**. A function that returns a list of HTMLElements to apply popovers to, where each element must contain an `href` attribute.

When this function is not included, the default behavior is to apply previews to all `a` tags on the page.

You might use this function to only add previews to a subset of the `a` tags on the page, for example those whose `href` is _external_ to the page:

```js
setPagePreviews({
  workerUrl: "https://...",
  getLinks: () => {
    const tags = [...document.getElementsByTagName("a")];
    return tags.filter((t) => {
      // remove any links to pages on this site
      return new URL(t.href).host !== window.location.host;
    });
  },
});
```

### `assignStyles`

---

**Optional**. A function that returns the stylesheet to use for a given element.

You might use this function to style popovers differently depending on if the links are external to the page or not. You can create two different style elements:

```html
<style id="external-links-styles">
  .hyperfov-link-url {
    color: lightcoral;
  }
</style>
<style id="internal-links-styles">
  .hyperfov-link-url {
    color: indianred;
  }
</style>
```

Then apply those styles depending on the link's `href`:

```js
setPagePreviews({
  workerUrl: "https://...",
  assignStyles: (tag) => {
    if (new URL(tag.href).host === window.location.host)
      return document.getElementById("internal-links-styles").sheet;
    else return document.getElementById("external-links-styles").sheet;
  },
});
```

### `assignPositions`

---

**Optional**. A function that returns the popover positioning method for a given element.

Valid return types are `"below"` or `"cursor"`.

You might use this function to position popovers differently depending on the links' classes:

```js
setPagePreviews({
  workerUrl: "...",
  assignPositions: (tag) => {
    if (tag.classList.contains("my-link")) return "cursor";
    else return "below";
  },
});
```
