# Link Previews Svelte example

This is an example of using link previews with dynamically rendered content.

Run it:

```
npm install
npm run dev
```

The svelte component in this example that wraps the `linkPreview` interface is quite simple; just pass the bound element to the constructor. Any changes to the element's attributes are updated internally, no need to manually remove the preview element when the component's props change.

```svelte
<script>
  import { linkPreview } from "link-previews";
  import { onMount } from "svelte";

  export let href;

  let thisElt;

  onMount(() => {
    linkPreview(thisElt, { backend: "http://localhost:8787" });
  });
</script>

<a bind:this={thisElt} {href} target="_blank" rel="noopener noreferrer">
  <slot />
</a>
```
