<svelte:options tag="link-preview" />

<script>
  import Wrapper from "./Wrapper.svelte";
  import Interior from "./Interior.svelte";

  import { atob } from "abab";

  export let position;
  export let href;
  export let id;

  position = JSON.parse(atob(position));

  let content;
  let title;
  let imgSrc;

  const showContent = content && content !== "null";
  const showImg = imgSrc && imgSrc !== "null";
</script>

<Wrapper {href} {showContent} {showImg} {position} id="{id}-sub">
  <Interior {showContent} {showImg} {content} {title} {href} />
</Wrapper>
