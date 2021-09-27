<svelte:options tag="link-preview" />

<script>
  import Wrapper from "./Wrapper.svelte";
  import Interior from "./Interior.svelte";

  import { onMount } from "svelte";

  import { atob } from "abab";

  export let position;
  export let href;
  export let id;
  export let worker;

  position = JSON.parse(atob(position));

  let content;
  let title;
  let imgSrc;
  let showImg = false;
  let showContent = false;
  let fetching = true;

  onMount(async () => {
    worker = atob(worker);

    const workerUrl = new URL(worker);
    workerUrl.searchParams.append("page", href);
    const res = await fetch(workerUrl);

    if (res.ok) {
      const json = await res.json();

      content = json.description;
      title = json.title;
      imgSrc = json.image;
    }

    fetching = false;
  });

  $: {
    showContent = content && content !== "null";
    showImg = imgSrc && imgSrc !== "null";
  }
</script>

<Wrapper {href} {showContent} {showImg} {position} id="{id}-sub">
  <Interior
    {showContent}
    {showImg}
    {content}
    {title}
    {href}
    {imgSrc}
    {fetching}
  />
</Wrapper>
