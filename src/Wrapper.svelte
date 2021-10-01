<script>
  export let showContent;
  export let showImg;
  export let eltPos;
  export let id;
  export let followCursor;

  let visible = false;
  let top;
  let left;
  let height;
  let width;

  $: {
    height = showContent ? 172 : 60;
    width = showContent && showImg ? 400 : 272;
    positionPreview();
  }

  const positionPreview = () => {
    // keep the previews a bit away from the sides
    const addedMargin = 40;

    if (eltPos) {
      const fullWidth = width + addedMargin;
      const fullHeight = height + addedMargin;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (windowWidth - eltPos.x < fullWidth) {
        left = windowWidth - fullWidth + window.scrollX;
      } else {
        left = eltPos.x + window.scrollX;
      }

      const y = followCursor ? eltPos.y + addedMargin / 2 : eltPos.bottom;

      if (windowHeight - y < fullHeight) {
        // above
        top = eltPos.y - height - addedMargin / 2 + window.scrollY;
      } else {
        // below
        top = y + window.scrollY;
      }
    }
  };

  $: {
    //  reposition when position changes
    if (eltPos) {
      visible = true;
      positionPreview();
    } else {
      visible = false;
    }
  }
</script>

<div
  class="preview"
  class:visible
  style="top:{top}px; left:{left}px; height:{height}px; width:{width}px;"
  {id}
>
  <div class="hyperfov-preview-element-wrapper">
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
</style>
