const basicTemplate = () => {
  return `
  <template id="hyperfov-link-preview-template">
  <style>
    .link-popup-wrapper {
      border: var(--lp-border, none);
      padding: var(--lp-padding, 10px);
      background: var(--lp-background, white);
      box-shadow: var(
        --lp-box-shadow,
        0px 5px 15px rgba(101, 101, 110, 0.3)
      );
      border-radius: var(--lp-border-radius, 6px);
      max-width: var(--lp-max-width, 225px);
      font-family: var(--lp-font-family, inherit);
      font-weight: var(--lp-font-weight, normal);
    }

    .link-interior-content div:not(:last-child):not(:first-child) {
      margin-top: 5px;
      margin-bottom: 5px;
    }

    .link-image {
      flex-shrink: 0;
    }

    .link-url {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      font-weight: var(--lp-link-font-weight, normal);
      color: var(--lp-link-color, grey);
      font-size: var(--lp-link-font-size, 12px);
      font-family: var(--lp-link-font-family, inherit);
      border: var(--lp-link-border, none);
    }

    .link-title {
      font-weight: var(--lp-title-font-weight, bold);
      color: var(--lp-title-color, inherit);
      font-size: var(--lp-title-font-size, 16px);
      font-family: var(--lp-title-font-family, inherit);
      border: var(--lp-title-border, none);
    }

    .link-description {
      font-weight: var(--lp-description-font-weight, normal);
      color: var(--lp-description-color, inherit);
      font-size: var(--lp-description-font-size, 16px);
      font-family: var(--lp-description-font-family, inherit);
      border: var(--lp-description-border, none);
    }

    ::slotted(#lp-image) {
      max-width: 100%;
      border-radius: var(--lp-image-border-radius, 3px);
      border: var(--lp-image-border, none);
      width: max-content;
      height: auto;
      object-fit: cover;
      object-position: top center;
      max-height: var(--lp-image-max-height, 150px);
      display: inline-block !important;
      margin: 0 !important;
    }

    ::slotted(#lp-favicon) {
      max-height: 14px;
      max-width: 14px;
      margin: 0 !important;
      margin-right: 5px !important;
      display: inline-block !important;
      width: auto !important;
    }
  </style>
  <div class="link-popup-wrapper">
    <div class="link-interior-content">
      <div class="link-image"><slot name="lp-image"></slot></div>
      <div class="link-title">
        <slot name="lp-favicon"></slot>
        <slot name="lp-title"></slot>
      </div>
      <div class="link-description">
        <slot name="lp-description"></slot>
      </div>
      <div class="link-url"><slot name="lp-href"></slot></div>
    </div>
  </div>
</template>`;
};

export default basicTemplate;
