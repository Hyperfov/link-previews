<script>
  import { slide } from "svelte/transition";
  import { cubicIn } from "svelte/easing";

  export let showContent;
  export let showImg;
  export let content;
  export let imgSrc;
  export let title;
  export let href;
  export let fetching;
</script>

{#if showContent || showImg}
  <div
    transition:slide={{ duration: 300, easing: cubicIn }}
    class="hyperfov-link-content-wrapper"
  >
    {#if showContent}
      <div class="hyperfov-link-content">{content}</div>
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
  <div
    class="hyperfov-link-title"
    transition:slide={{ duration: 300, easing: cubicIn }}
  >
    {title}
  </div>
{/if}
<div class="hyperfov-link-url">
  {#if fetching}
    <span
      transition:slide={{ duration: 300, easing: cubicIn }}
      class="hyperfov-loading"
    />
  {/if}
  {href}
</div>

<style>
  .hyperfov-link-title {
    font-weight: bold;
  }

  .hyperfov-link-content-wrapper {
    display: flex;
    border-bottom: 1px solid black;
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
    font-size: 14px;
    display: inline-block;
    position: relative;
    height: 120px;
    overflow: hidden;
    background-color: white;
  }

  .hyperfov-link-content::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 275px;
    height: 50px;
    background-image: linear-gradient(#ffffff00, #ffffff);
  }

  .hyperfov-loading {
    width: 5px;
    height: 5px;
    background-color: black;
    border-radius: 50%;
    animation: fade 1s ease infinite;
    margin-bottom: 2px;
    display: inline-block;
  }

  @keyframes fade {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.1;
    }
  }
</style>
