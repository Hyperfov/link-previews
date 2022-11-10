# Link Previews

When added to a webpage, hovering links displays a wikipedia-style dynamic page preview.

This package is composed of two parts:

- A javascript function `linkPreview` that can add a link preview web component to any `a` tag on your page.
- A Cloudflare Workers function that fetches and serves the links' meta information to the web component.

## Usage

### Deploy the worker

Follow the instructions in [the worker's readme](worker/README.md) to deploy the worker to Cloudflare Workers. Once complete you should have a url like `https://worker.[something].workers.dev`, or a custom domain if you've opted to set one up.

### Add the script to your page

The latest build can be found on [the releases page](https://github.com/Hyperfov/link-previews/releases).

Add the script to the end of your site's `body`:

```html
<html>
  <head>
    <title>Link Previews</title>
  </head>
  <body>
    <!-- page markup here including some links: -->
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      <a id="myLink" href="https://hyperfov.com">A cool link</a>
    </p>

    <!-- Insert the link preview script at the end of the body -->
    <script src="hyperfov-link-previews.js"></script>
  </body>
</html>
```

Now, you can call `linkPreview` for any links that should get a link preview:

```js
linkPreview("#myLink", {
  backend: "https://link-to-worker.workers.dev",
});
```

Which elements you add links to and when is up to you. For example, you might add previews to all links on the page:

```js
document.querySelectorAll("a").forEach((elt) => {
  linkPreview(elt, {
    backend: "https://link-to-worker.workers.dev",
  });
});
```

You can also customize the previews' styling. For example:

```html
<style>
  link-preview {
    --lp-border: 1px dashed rebeccapurple;
    --lp-title-color: rebeccapurple;
  }
</style>
```

For more on styling, see [custom previews](#custom-previews).

### Options

You can customize the preview element through the `options` in the constructor:

```js
linkPreview("#myLink", {
  backend: "https://link-to-worker.workers.dev",
  template: "#my-cool-template", // a custom template for rendering the preview
  content: {
    title: "My cool link", // override the title returned by the worker
  },
  tippyOptions: {
    // pass through any options to tippy for positioning here
    followCursor: true,
  },
});
```

Here's the full list of options:

| Option         | Value                                                                                                                                                                            | Default                         | Required? |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------- |
| `backend`      | A string with the URL of the deployed worker (see [Deploy the worker](#deploy-the-worker).)                                                                                      | `null`                          | `false`   |
| `template`     | The selector of the template element to use to render the preview (see [Custom styles and markup](#custom-previews).) The default `"basic"` uses a provided template.            | `"basic"`                       | `false`   |
| `fetch`        | Fetch the url's content from the worker? (See [prefetch data](#prefetch-data) below)                                                                                             | `true`                          | `false`   |
| `tippyOptions` | The options passed to tippy that control the behavior and position of the popup. See all [options in the tippy docs](https://atomiks.github.io/tippyjs/v6/all-props/#placement). | `{ placement: "bottom-start" }` | `false`   |
| `content`      | The content of the preview (see [content options](#content-options) below)                                                                                                       | `{}`                            | `false`   |

#### Content options

The `content` parameter can include keys such as `title`, `description`, `href`, and `image` to override what's returned by the worker:

```js
linkPreview(elt, {
  content: {
    href: "https://example.com/",
    description: "Some interesting description",
    title: "Example link",
  },
});
```

Any of the keys in `content` can also be specified on the element with attributes:

```html
<a
  href="https://example.com/"
  lp-description="Some interesting description"
  lp-title="Example link"
  >example</a
>
```

The same is true of `tippyOptions` using tippy's attributes. The following are equivalent:

```js
linkPreview(elt, {
  tippyOptions: {
    placement: "bottom-start",
    offset: [0, 10],
    delay: 200,
  },
});
```

```html
<a
  href="https://example.com/"
  data-tippy-placement="bottom-start"
  data-tippy-offset="[0, 10]"
  data-tippy-delay="200"
  >example</a
>
```

#### Prefetch data

If you wanted to prefetch all of the link previews rather than fetching them dynamically, you could manually fetch at generation time, then use attributes on the element to add descriptions, titles, and images:

```html
<a
  href="https://example.com/"
  lp-description="This is an example"
  lp-title="Example link"
  lp-image="https://example.com/social.png"
  >example</a
>
```

Then instantiate, setting `fetch` in the options to `false` to prevent the component from re-fetching:

```js
document.querySelectorAll("a").forEach((elt) => {
  linkPreview(elt, {
    fetch: false,
  });
});
```

### Custom previews

#### Styling

You can style the basic template with CSS variables set in the `link-preview` selector:

```css
link-preview {
  --lp-title-color: red;
  --lp-link-color: blue;
}
```

Variables are in the form `--lp-[element]-[css property]`. Here's all the variables the template accepts:

| Variable                       | Default value                           |
| ------------------------------ | --------------------------------------- |
| `--lp-border`                  | `none`                                  |
| `--lp-padding `                | `10px`                                  |
| `--lp-background`              | `white`                                 |
| `--lp-box-shadow`              | `0px 5px 15px rgba(101, 101, 110, 0.3)` |
| `--lp-border-radius`           | `6px`                                   |
| `--lp-max-width`               | `225px`                                 |
| `--lp-font-family`             | `inherit`                               |
| `--lp-font-weight`             | `normal`                                |
| `--lp-link-color`              | `grey`                                  |
| `--lp-link-border`             | `none`                                  |
| `--lp-link-font-size`          | `12px`                                  |
| `--lp-link-font-family `       | `inherit`                               |
| `--lp-link-font-weight`        | `normal`                                |
| `--lp-title-color`             | `inherit`                               |
| `--lp-title-border`            | `none`                                  |
| `--lp-title-font-size`         | `16px`                                  |
| `--lp-title-font-family`       | `inherit`                               |
| `--lp-title-font-weight`       | `bold`                                  |
| `--lp-description-color`       | `inherit`                               |
| `--lp-description-border`      | `none`                                  |
| `--lp-description-font-size`   | `16px`                                  |
| `--lp-description-font-family` | `inherit`                               |
| `--lp-description-font-weight` | `normal`                                |
| `--lp-image-border`            | `none`                                  |
| `--lp-image-border-radius`     | `3px`                                   |
| `--lp-image-max-height`        | `150px`                                 |

#### Custom templates

For instances where the css variables aren't enough, the link preview is completely customizable through an [html template](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) with [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot). The template that's used by default can be found at [`client/src/templates/basic.js`](/client/src/templates/basic.js).

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
