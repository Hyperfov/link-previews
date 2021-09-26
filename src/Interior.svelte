<script>
  export let showContent;
  export let showImg;
  export let content;
  export let imgSrc;
  export let title;
  export let href;
</script>

{#if showContent || showImg}
  <div class="hyperfov-link-content-wrapper">
    {#if showContent}
      <div class="hyperfov-link-content">{@html content}</div>
    {/if}
    {#if showImg}
      <img
        class="hyperfov-link-image"
        class:left={showContent}
        src={imgSrc}
        alt={title}
      />
    {/if}
  </div>
{/if}
{#if title}
  <div class="hyperfov-link-title">{title}</div>
{/if}
<div class="link-url hyperfov-link-url">{href}</div>

<style>
  .hyperfov-link-title {
    font-weight: bold;
  }

  .hyperfov-link-content-wrapper {
    display: flex;
    border-bottom: 1px solid var(--color);
    margin-bottom: 5px;
  }

  .hyperfov-link-image {
    height: 120px;
    object-fit: cover;
    object-position: center center;
    width: 100%;
    min-width: 150px;
  }

  .hyperfov-link-image.left {
    padding-left: 10px;
  }

  .hyperfov-link-url {
    font-size: 12px;
    color: black;
  }

  .hyperfov-link-content {
    font-size: 16px;
    line-height: 110%;
    display: inline-block;
    position: relative;
    height: 120px;
    overflow: hidden;
    background-color: white;
    border: 1px solid black;
  }

  .hyperfov-link-content::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 275px;
    height: 50px;
    background-image: linear-gradient(transparent, white);
  }
</style>
