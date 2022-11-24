<script>
  import { linkPreview } from "link-previews";
  import { onMount } from "svelte";

  export let config;

  let preview;
  let thisElt;

  onMount(() => {
    preview = linkPreview(thisElt, {
      worker: "http://localhost:8787",
      ...config,
    })[0];
  });

  $: {
    if (config && preview) {
      preview.setProps(config);
    }
  }
</script>

<a
  bind:this={thisElt}
  href={config.content.href}
  target="_blank"
  rel="noopener noreferrer"
>
  <slot />
</a>
