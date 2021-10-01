<svelte:options tag="link-preview" />

<script>
  import Wrapper from "./Wrapper.svelte";
  import Interior from "./Interior.svelte";
  import { b64ToUtf8 } from "./utils/encodeDecode";

  export let href;
  export let id;
  export let data;
  export let position;
  export let followcursor;
  export let fetching;

  let eltPos;
  let content = null;
  let title = null;
  let imgSrc = null;

  $: {
    if (position) {
      try {
        eltPos = JSON.parse(b64ToUtf8(position));
      } catch {
        eltPos = null;
      }
    }
  }

  $: {
    if (data) {
      try {
        const json = JSON.parse(b64ToUtf8(data));
        content = json.description;
        title = json.title;
        imgSrc = json.image;
      } catch {
        content = null;
        title = null;
        imgSrc = null;
      }
    }
  }

  let showImg = false;
  let showContent = false;

  $: {
    showContent = content !== null && content !== undefined;
    showImg = imgSrc !== null && imgSrc !== undefined;
  }
</script>

<Wrapper
  {href}
  {showContent}
  {showImg}
  {eltPos}
  followCursor={followcursor === "true"}
  id="{id}-sub"
>
  <Interior
    {showContent}
    {showImg}
    {content}
    {title}
    {href}
    {imgSrc}
    fetching={fetching === "true"}
  />
</Wrapper>
