# Link Previews

When added to a webpage, hovering links displays a wikipedia-style dynamic page preview.

This package is composed of two parts:

- A javascript function `linkPreview` that can add a link preview web component to any `a` tag on your page.
- A Cloudflare Workers function that fetches and serves the links' meta information to the web component.

## Usage

### Deploy the worker

Follow the instructions in [the worker's docs](worker/README.md) to deploy the worker to Cloudflare Workers. Once complete you should have a url like `https://worker.[something].workers.dev`, or a custom domain if you've opted to set one up.

### Add the script to your page

The latest build can be found on [the releases page](https://github.com/Hyperfov/link-previews/releases).

Add the script to the end of your site's `body`:

```html
<html>
  <body>
    <!-- page markup here with some a tags: -->
    <a id="myLink" href="https://example.com">A cool link</a>
    <!-- Insert the link preview script at the end of the body -->
    <script src="hyperfov-link-previews.js"></script>
    <script>
      // now we can call `linkPreview` to add a preview
      linkPreview("#myLink", {
        worker: "https://link-to-worker.workers.dev",
      });
    </script>
  </body>
</html>
```

Add link previews by passing through a selector, element, or list of elements and [configuration props](#props) to the global `linkPreview` constructor:

```js
linkPreview("#myLink", {
  worker: "https://link-to-worker.workers.dev",
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

For more on styling and custom templates, see [custom previews](#custom-previews).

## Props

You can configure the preview element by passing through props in the constructor:

```js
linkPreview("#myLink", {
  // props get passed through here
});
```

Valid props:

- [`worker`](#worker)
- [`template`](#template)
- [`fetch`](#fetch)
- [`fetchOnHover`](#fetchonhover)
- [`content`](#content)
- [`tippyProps`](#tippyprops)

### `worker`

The URL of the deployed worker. See the worker's [docs](/worker/README.md) for deployment information.

### `template`

The selector of the template element used to render the preview. See [custom previews](#custom-previews) for more on templates. If nothing is passed, a default template is used.

### `fetch`

Should the worker be called to get information for this link? Defaults to `true`. You may want to set this to `false` if you're pregenerating a page and don't want to make calls to the worker at runtime.

### `fetchOnHover`

Should the link preview content be fetched when the user hovers on the link? Defaults to `true`. When set to `false`, the preview content is fetched immediately when the preview component is initialized.

### `content`

The data passed through to the template's slots. This object can include props such as `title`, `description`, `href`, and `image`:

```js
linkPreview(elt, {
  content: {
    href: "https://example.com/",
    description: "Some interesting description",
    title: "Example link",
  },
});
```

Note that passing through data in `content` will override any data that's returned by the worker.

Any of the keys in `content` can also be specified on the element with attributes prefixed with `lp-`:

```html
<a
  href="https://example.com/"
  lp-description="Some interesting description"
  lp-title="Example link"
  >example</a
>
```

### `tippyProps`

Props that are passed through to [tippy.js](https://atomiks.github.io/tippyjs/), the library used for the preview popups. These can allow you to modify the positioning of the preview and provide options such as an offset, delay, and animation:

```js
linkPreview(elt, {
  tippyOptions: {
    placement: "bottom-start",
    animation: "scale",
    offset: [0, 10],
    delay: 200,
  },
});
```

Find the full list of props on [the tippy docs](https://atomiks.github.io/tippyjs/v6/all-props/).

All of the props in `tippyProps` can also be specified on the element with attributes prefixed with `tippy-data-`:

```html
<a
  href="https://example.com/"
  data-tippy-placement="bottom-start"
  data-tippy-animation="scale"
  data-tippy-offset="[0, 10]"
  data-tippy-delay="200"
  >example</a
>
```

## Custom previews

### Styling

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
| `--lp-padding `                | `0`                                     |
| `--lp-background`              | `white`                                 |
| `--lp-box-shadow`              | `0px 5px 15px rgba(101, 101, 110, 0.3)` |
| `--lp-border-radius`           | `6px`                                   |
| `--lp-max-width`               | `225px`                                 |
| `--lp-font-family`             | `inherit`                               |
| `--lp-font-weight`             | `normal`                                |
| `--lp-link-padding`            | `0 10px`                                |
| `--lp-link-color`              | `grey`                                  |
| `--lp-link-border`             | `none`                                  |
| `--lp-link-font-size`          | `12px`                                  |
| `--lp-link-font-family `       | `inherit`                               |
| `--lp-link-font-weight`        | `normal`                                |
| `--lp-title-padding`           | `0 10px 3px 10px`                       |
| `--lp-title-color`             | `inherit`                               |
| `--lp-title-border`            | `none`                                  |
| `--lp-title-font-size`         | `16px`                                  |
| `--lp-title-font-family`       | `inherit`                               |
| `--lp-title-font-weight`       | `bold`                                  |
| `--lp-description-padding`     | `0 10px 3px 10px`                       |
| `--lp-description-color`       | `inherit`                               |
| `--lp-description-border`      | `none`                                  |
| `--lp-description-font-size`   | `16px`                                  |
| `--lp-description-font-family` | `inherit`                               |
| `--lp-description-font-weight` | `normal`                                |
| `--lp-image-border`            | `none`                                  |
| `--lp-image-border-radius`     | `3px 3px 0 0`                           |
| `--lp-image-object-fit`        | `cover`                                 |
| `--lp-image-object-position`   | `center center`                         |
| `--lp-image-max-height`        | `150px`                                 |

### Custom templates

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
  worker: "https://link-to-worker.workers.dev",
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
