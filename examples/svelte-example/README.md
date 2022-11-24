# Link Previews Svelte example

This is an example of using link previews with dynamically rendered content.

Run it:

```
npm install
npm run dev
```

The component can be used like this:

```jsx
<LinkPreview
  config={{ content: { href: url }, tippy: { followCursor: true } }} // pass link preview props here
>
  This is a link to {url}
</LinkPreview>
```
