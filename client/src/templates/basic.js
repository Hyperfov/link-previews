const basicTemplate = () => {
  return `
  <template id="hyperfov-link-preview-template">
  <style>
        .link-popup-wrapper {
          padding: 10px;
          background-color: white;
          box-shadow: 0px 5px 15px rgba(101, 101, 110, 0.3);
          border-radius: 6px;
          max-width: 225px;
        }
        .link-interior-content div:not(:last-child):not(:first-child) {
          margin-top: 5px;
          margin-bottom: 5px;
        }
        .link-url {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          opacity: 0.5;
          font-size: 12px;
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
          width: max-content;
          height: auto;
          object-fit: cover;
          object-position: top center;
          max-height: 150px;
        }
      </style>
      <div class="link-popup-wrapper">
        <div class="link-interior-content">
          <div class="link-image"><slot name="lp-image"></slot></div>
          <div class="link-title"><slot name="lp-title"></slot></div>
          <div class="link-description">
            <slot name="lp-description"></slot>
          </div>
          <div class="link-url"><slot name="lp-href"></slot></div>
        </div>
      </div>
  </template>`;
};

export default basicTemplate;
