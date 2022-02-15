const basicTemplate = () => {
  return `
  <template id="hyperfov-link-preview-template">
  <style>
    .link-popup-wrapper {
      padding: 10px;
      background-color: white;
      box-shadow: 0px 0px 20px rgba(122, 122, 122, 0.63);
      border-radius: 6px;
      max-width: 275px;
    }

    .link-interior-content div:not(:first-child) {
      margin-top: 5px;
    }

    .has-image .link-url,
    .has-title .link-url,
    .has-description .link-url,
    .has-title .link-url {
      margin-top: 10px;
    }

    .link-url {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .link-image {
      flex-shrink: 0;
    }

    .link-title {
      font-weight: bold;
    }

    ::slotted(img) {
      max-width: 100%;
      border-radius: 3px;
      width: 100%;
      height: auto;
      object-fit: cover;
      object-position: center center;
      max-height: 250px;
    }
  </style>
  <div class="link-popup-wrapper">
    <div class="link-interior-content">
      <div class="link-image"><slot name="image"></slot></div>
      <div class="link-title"><slot name="title"></slot></div>
      <div class="link-description">
        <slot name="description"></slot>
      </div>
    </div>
    <div class="link-url"><slot name="url"></slot></div>
  </div>
</template>`;
};

export default basicTemplate;
