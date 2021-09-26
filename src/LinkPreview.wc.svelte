<svelte:options tag="link-preview" />

<script>
  import Wrapper from "./Wrapper.svelte";
  import Interior from "./Interior.svelte";

  import { atob } from "abab";

  export let linkcontent;
  export let href;
  export let styles;

  styles = JSON.parse(atob(styles));

  let content;
  let title;
  let imgSrc;

  const showContent = content && content !== "null";
  const showImg = imgSrc && imgSrc !== "null";
</script>

<Wrapper {href} {showContent} {showImg} {linkcontent}>
  <Interior
    slot="preview-content"
    {showContent}
    {showImg}
    {content}
    {title}
    {href}
  />
</Wrapper>
