<script>
  export let showContent;
  export let showImg;
  export let eltPos;
  export let id;
  export let position;
  export let fetchData;

  let cursorPos;

  let visible = false;
  let top;
  let left;

  let height = showContent ? 172 : 60;
  let width = showContent && showImg ? 400 : 272;

  $: {
    height = showContent ? 172 : 60;
    width = showContent && showImg ? 400 : 272;
  }

  let renderedHeight = height;
  let element;

  const positionPreview = (actualHeight) => {
    // keep the previews a bit away from the sides
    const addedMargin = 40;

    if (cursorPos) {
      top = cursorPos.y + addedMargin / 2;
      left = cursorPos.x + addedMargin / 2;
    } else if (element) {
      const linkPos = element.getBoundingClientRect();
      const fullWidth = width + addedMargin;
      const fullHeight = actualHeight + addedMargin;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (windowWidth - linkPos.x < fullWidth) {
        left = windowWidth - fullWidth + window.scrollX;
      } else {
        left = linkPos.x + window.scrollX;
      }

      if (windowHeight - (linkPos.y + linkPos.height) < fullHeight) {
        top = linkPos.y - actualHeight - addedMargin / 2 + window.scrollY;
      } else {
        top = linkPos.y + linkPos.height + window.scrollY;
      }
    }
  };

  $: {
    // reposition when height changes
    positionPreview(renderedHeight);
  }

  const onMove = (e) => {
    cursorPos = {
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY,
    };
    positionPreview(renderedHeight);
  };

  const toggleOn = () => {
    if (fetchData) fetchData();
    positionPreview(renderedHeight);
    visible = true;
  };
  const toggleOff = () => {
    visible = false;
  };
</script>

<span
  class="preview-wrapper"
  style="top:{eltPos.y}px; left:{eltPos.x}px; height:{eltPos.height}px; width:{eltPos.width}px;"
  on:mouseover={toggleOn}
  on:mousemove={position === "cursor" ? onMove : null}
  on:focus={toggleOn}
  on:mouseout={toggleOff}
  on:blur={toggleOff}
  bind:this={element}
/>
<div
  class="preview"
  class:visible
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

<style>
  .preview {
    z-index: 1000;
    position: absolute;
    transition: opacity 0.5s;
    visibility: hidden;
    opacity: 0;
  }

  .preview.visible {
    opacity: 1;
    visibility: visible;
  }

  .hyperfov-preview-element-wrapper {
    font-family: sans-serif;
    color: black;
    max-width: 100%;
    text-decoration: none;
    padding: 10px;
    margin-top: 5px;
    font-weight: normal;
    font-style: normal;
    font-size: 14px;
    border: 1px solid black;
    background-color: white;
  }

  .preview-wrapper {
    position: absolute;
  }
</style>
