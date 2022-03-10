# Link Previews

Link previews everywhere.

When added to a webpage, hovering links displays a wikipedia-style dynamic page preview.

## Usage

There are two parts to this project:

- A function `linkPreview` for adding and initializing a link preview web component for each link.
- A serverless worker function that fetches and serves the links' meta information to the web components.

The worker is required because CORs prevents cross-origin client requests. For example, trying to directly `fetch` a url like `https://matrix.org` from your webpage will fail since most servers are configured to reject cross-origin requests. As a result, it's necessary to make the request outside the browser.

Since the task of fetching a page and parsing out the meta information is so simple, it can be accomplished with a single serverless function. I'm using [Cloudflare Workers](https://workers.cloudflare.com/) but you could probably rewrite it for some other service like AWS Lambda.

### Deploy the worker

Follow the instructions in [the worker's readme](worker/README.md) to deploy the worker. Once complete, you should have a url like `https://worker.[something].workers.dev`, or a custom domain if you've opted to set one up.

### Add the script and instantiate

The latest build can be found in [`client/dist`](/client/dist/).

Add the script to the end of your site's `body`:

```html
<html>
  <head>
    <title>Link Previews</title>
  </head>
  <body>
    <a id="myLink" href="https://hyperfov.com">A cool link</a>

    <!-- Insert the link preview script at the end of the body -->
    <script src="hyperfov-link-previews.js"></script>
  </body>
</html>
```

Then, call `linkPreview` for each link you'd like to add a preview to:

```html
<html>
  <head>
    <title>Link Previews</title>
  </head>
  <body>
    <a id="myLink" href="https://hyperfov.com">A cool link</a>

    <script src="hyperfov-link-previews.js"></script>
    <!-- Initialize the link previews -->
    <script>
      linkPreview("#myLink", {
        backend: "https://link-to-worker.workers.dev",
      });
    </script>
  </body>
</html>
```

To add previews to all links on the page:

```js
document.querySelectorAll("a").forEach((elt) => {
  linkPreview(elt, {
    backend: "http://localhost:8787",
  });
});
```

### Options

You can customize the preview element through the `options` in the constructor:

```js
linkPreview("#myLink", {
  backend: "https://link-to-worker.workers.dev",
  template: "#my-cool-template", // a custom template for rendering the preview
  position: "below", // "below" or "above" the link, or "follow" the cursor
});
```

Here's the full list of options:

| Option     | Value                                                                                                                                                                 | Default   | Required? |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- |
| `backend`  | A string with the URL of the deployed worker (see [Deploy the worker](#deploy-the-worker).)                                                                           | `null`    | `false`   |
| `template` | The selector of the template element to use to render the preview (see [Custom styles and markup](#custom-previews).) The default `"basic"` uses a provided template. | `"basic"` | `false`   |
| `fetch`    | Fetch the url's content from the worker? (See [prefetch data](#prefetch-data) below)                                                                                  | `true`    | `false`   |
| `position` | Where the preview will be placed relative to the link. `"below"`, `"above"` or `"follow"` to follow the cursor                                                        | `"below"` | `false`   |
| `content`  | The content of the preview (see [content options](#content-options) below)                                                                                            | `{}`      | `false`   |

#### Content options

The `content` parameter can include keys such as `title`, `description`, `href`, and `image`. Note that any of the keys in `content` can also specified on the element itself though the same keys prefixed with `lp-`. For example:

```html
<a
  href="https://example.com/"
  lp-description="loading..."
  lp-title="Example link"
  >example</a
>
```

is the equivalent of initializing with

```js
linkPreview(elt, {
  content: {
    href: "https://example.com/",
    description: "loading...",
    title: "Example link",
  },
});
```

#### Prefetch data

If you wanted to prefetch all of the link previews rather than fetching them dynamically, you could manually fetch at generation time then add descriptions, titles, and images to all your page's `a` tags:

```html
<a
  href="https://example.com/"
  lp-description="This is an example"
  lp-title="Example link"
  lp-image="https://example.com/social.png"
  >example</a
>
```

Then instantiate, setting `fetch` in the options to false to prevent the component from re-fetching:

```js
document.querySelectorAll("a").forEach((elt) => {
  linkPreview(elt, {
    fetch: false,
  });
});
```

### Custom previews

The link preview is totally customizable through an [html template](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) with [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot). The template that's used by default can be found at [`client/src/templates/basic.js`](/client/src/templates/basic.js).

Add a custom template to your page (the `template` element is invisible, so this can be anywhere in the document):

```html
<template id="link-preview-template">
  <style>
    .wrapper {
      padding: 20px;
      background-color: lightsalmon;
    }
  </style>
  <div class="wrapper">
    <slot name="lp-title">my title</slot>
    <div><slot name="lp-description">my description</slot></div>
    <div><slot name="lp-href">my url</slot></div>
  </div>
</template>
```

The styling and markup is totally up to you, though you must ensure styles are either inline or included in a `style` tag in the template. The link preview component will look for a slots `lp-title`, `lp-description`, `lp-url`, `lp-favicon`, and `lp-image` to insert content. Data that doesn't have corresponding slot in the template won't be displayed, so for example if you don't specify an `lp-image` slot, no image will be inserted.

Once you've created a template, pass its `id` as an option when instantiating your link previews:

```js
linkPreview("#myLink", {
  backend: "https://link-to-worker.workers.dev",
  template: "#link-preview-template",
});
```

## Development

### Worker

Follow the directions to start the worker in [the worker's readme](worker/README.md).

### Client

To run the client, enter the `client` directory and install the dependencies:

```
npm install
```

Then run the development server:

```
npm run dev
```

You should now be able to navigate to `localhost:9000` in the browser to try out the examples.

To build the client:

```
npm run build
```
