<script>
  import { fade } from "svelte/transition";
  import { cubicIn } from "svelte/easing";

  // export let external = false;

  export let showContent;
  export let showImg;
  export let position;
  export let id;

  console.log(position);

  let visible = false;
  let top;
  let left;

  const height = showContent ? 172 : 60;
  const width = showContent && showImg ? 400 : 272;
  let renderedHeight = height;

  let element;

  const positionPreview = (actualHeight) => {
    if (element) {
      const linkPos = element.getBoundingClientRect();

      // keep the previews a bit away from the sides
      const addedMargin = 40;
      const fullWidth = width + addedMargin;
      const fullHeight = actualHeight + addedMargin;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (windowWidth - linkPos.x < fullWidth) {
        left = windowWidth - fullWidth;
      } else {
        left = linkPos.x;
      }

      if (windowHeight - (linkPos.y + linkPos.height) < fullHeight) {
        top = linkPos.y - actualHeight - linkPos.height + 5;
      } else {
        top = linkPos.y + linkPos.height;
      }
    }
  };

  $: {
    // reposition when height changes
    positionPreview(renderedHeight);
  }

  const toggleOn = () => {
    positionPreview(renderedHeight);
    visible = true;
  };
  const toggleOff = () => {
    visible = false;
  };
</script>

<span
  class="preview-wrapper"
  style="top:{position.y}px; left:{position.x}px; height:{position.height}px; width:{position.width}px;"
  on:mouseover={toggleOn}
  on:focus={toggleOn}
  on:mouseout={toggleOff}
  on:blur={toggleOff}
  bind:this={element}
/>
{#if visible}
  <div
    transition:fade={{ duration: 300, easing: cubicIn }}
    class="preview"
    style="top:{top}px; left:{left}px; height:{height}px; width:{width}px;"
    {id}
  >
    <div
      class="hyperfov-preview-element-wrapper"
      bind:clientHeight={renderedHeight}
    >
      <slot />
    </div>
  </div>
{/if}

<style>
  .preview {
    z-index: 1000;
    position: absolute;
  }

  .hyperfov-preview-element-wrapper {
    max-width: 100%;
    text-decoration: none;
    padding: 10px;
    margin-top: 5px;
    font-weight: normal;
    font-style: normal;
  }

  .preview-wrapper {
    position: absolute;
  }
</style>
