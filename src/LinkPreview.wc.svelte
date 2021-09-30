<svelte:options tag="link-preview" />

<script>
  import Wrapper from "./Wrapper.svelte";
  import Interior from "./Interior.svelte";

  import { onMount } from "svelte";

  import { atob } from "abab";

  export let eltpos;
  export let href;
  export let id;
  export let worker;
  export let position;
  export let fetchon;

  let eltPos = JSON.parse(atob(eltpos));

  let content;
  let title;
  let imgSrc;
  let showImg = false;
  let showContent = false;
  let fetching = null;

  const fetchData = async () => {
    if (fetching === null) {
      try {
        fetching = true;
        const workerUrl = new URL(atob(worker));
        workerUrl.searchParams.append("page", href);
        const res = await fetch(workerUrl);

        if (res.ok) {
          const json = await res.json();

          content = json.description;
          title = json.title;
          imgSrc = json.image;
        }

        fetching = false;
      } catch (e) {
        // ignore failures
      }
    }
  };

  onMount(() => {
    if (fetchon === "load") fetchData();
  });

  $: {
    showContent = content && content !== "null";
    showImg = imgSrc && imgSrc !== "null";
  }
</script>

<Wrapper
  {href}
  {showContent}
  {showImg}
  {eltPos}
  {position}
  fetchData={fetchon === "hover" ? fetchData : null}
  id="{id}-sub"
>
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
