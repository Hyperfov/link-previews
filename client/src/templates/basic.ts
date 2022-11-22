const basicTemplate = (): string => {
  return `
  <template id="hyperfov-link-preview-template">
  <style>
    .link-popup-wrapper {
      border: var(--lp-border, none);
      padding: var(--lp-padding, 0px);
      background: var(--lp-background, white);
      box-shadow: var(
        --lp-box-shadow,
        0px 5px 15px rgba(101, 101, 110, 0.3)
      );
      border-radius: var(--lp-border-radius, 6px);
      max-width: var(--lp-max-width, 300px);
      font-family: var(--lp-font-family, inherit);
      font-weight: var(--lp-font-weight, normal);
    }

    .link-interior-content div:first-child {
      padding-top: 5px;
    }

    .link-interior-content div:last-child {
      padding-bottom: 5px;
    }

    .link-image {
      flex-shrink: 0;
    }

    .link-url {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      padding: var(--lp-link-padding, 0 10px);
      font-weight: var(--lp-link-font-weight, normal);
      color: var(--lp-link-color, grey);
      font-size: var(--lp-link-font-size, 12px);
      font-family: var(--lp-link-font-family, inherit);
      border: var(--lp-link-border, none);
    }

    .link-title {
      padding: var(--lp-title-padding, 0 10px 3px 10px);
      font-weight: var(--lp-title-font-weight, bold);
      color: var(--lp-title-color, inherit);
      font-size: var(--lp-title-font-size, 16px);
      font-family: var(--lp-title-font-family, inherit);
      border: var(--lp-title-border, none);
    }

    .link-description {
      padding: var(--lp-description-padding, 0 10px 3px 10px);
      font-weight: var(--lp-description-font-weight, normal);
      color: var(--lp-description-color, inherit);
      font-size: var(--lp-description-font-size, 16px);
      font-family: var(--lp-description-font-family, inherit);
      border: var(--lp-description-border, none);
    }

    ::slotted(#lp-image) {
      max-width: 100%;
      border-radius: var(--lp-image-border-radius, 3px 3px 0 0);
      border: var(--lp-image-border, none);
      width: max-content;
      height: auto;
      object-fit: var(--lp-image-object-fit, cover);
      object-position: var(--lp-image-object-position, center center);
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
    <div class="link-image"><slot name="lp-image"></slot></div>
    <div class="link-interior-content">
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

export { basicTemplate };
