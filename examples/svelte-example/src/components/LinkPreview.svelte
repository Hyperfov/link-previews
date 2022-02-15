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
