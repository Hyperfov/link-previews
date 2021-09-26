<script>
  export let showContent;
  export let showImg;
  export let content;
  export let imgSrc;
  export let title;
  export let href;
</script>

{#if showContent || showImg}
  <div class="link-content-wrapper">
    {#if showContent}
      <div class="link-content">{@html content}</div>
    {/if}
    {#if showImg}
      <img
        class="link-image"
        class:left={showContent}
        src={imgSrc}
        alt={title}
      />
    {/if}
  </div>
{/if}
{#if title}
  <div class="link-title">{title}</div>
{/if}
<div class="hyperfov-link-url">{href}</div>

<style>
  .link-content {
    font-size: 16px;
    line-height: 110%;
    display: inline-block;
    position: relative;
    height: 120px;
    overflow: hidden;
  }

  .link-title {
    font-weight: bold;
  }

  .link-content-wrapper {
    display: flex;
    border-bottom: 1px solid var(--color);
    margin-bottom: 5px;
  }

  .link-image {
    height: 120px;
    object-fit: cover;
    object-position: center center;
    width: 100%;
    min-width: 150px;
  }

  .link-image.left {
    padding-left: 10px;
  }

  .hyperfov-link-url {
    font-size: 12px;
  }

  .link-content::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 275px;
    height: 50px;
    background-image: linear-gradient(transparent, white);
  }
</style>
