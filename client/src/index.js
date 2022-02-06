/**
 * HYPERFOV PAGE PREVIEWS
 *
 * This is a small script that can be configured to show a preview of a link
 * It's meant to be a minimal, framework-agnostic implementation that can
 * be added to any page.
 */

const defaultPreviewTemplate = `
<template id="hyperfov-link-preview-template">
<p>my template</p>
</template>
`;

import LinkPreview from "./components/LinkPreview";
import getElement from "./utils/getElement";

customElements.define("link-preview", LinkPreview);

/**
 * Add a link preview to an <a> tag. Adds the custom <link-preview> element
 * and watches for hover events.
 *
 * @param {string|HTMLElement} elt - the element to add the link preview to
 * @param {Object} opts - configuration for the link preview
 */
function linkPreview(elt, opts = {}) {
  const options = {
    title: null,
    description: null,
    img: null,
    url: null,
    backend: null,
    fetchLink: true,
    position: "below",
    template: "#hyperfov-link-preview-template",
    ...opts,
  };

  if (!options.backend && options.fetchLink) {
    console.error("HYPERFOV LINK PREVIEWS >> missing backend url");
  }

  let element = getElement(elt);

  if (!opts.template) {
    // if the user hasn't provided a template, verify that the default template exists
    const templateElt = document.querySelector(options.template);
    if (!(templateElt instanceof HTMLElement)) {
      // no default template exists; add the default template to the DOM
      const templateWrapper = document.createElement("div");
      templateWrapper.innerHTML = defaultPreviewTemplate;
      document.body.appendChild(templateWrapper);
    }
  }

  // TODO verify the element has a valid href
  // TODO watch the element for changes

  // add a link-preview element to the dom for this element
  const preview = document.createElement("link-preview");

  preview.setAttribute("position", options.position);

  if (options.url) preview.setAttribute("url", options.url);
  else preview.setAttribute("url", element.href);

  if (options.template) preview.setAttribute("template", options.template);
  if (options.description)
    preview.setAttribute("description", options.description);
  if (options.img) preview.setAttribute("img", options.img);
  if (options.title) preview.setAttribute("title", options.title);
  if (options.backend) preview.setAttribute("backend", options.backend);

  document.body.appendChild(preview);

  // watch for hover events on the element
  element.addEventListener("mouseover", () => {
    const pos = element.getBoundingClientRect();
    preview.setAttribute("parent", JSON.stringify(pos));
    preview.setAttribute("open", "true");
  });

  element.addEventListener("mouseout", () => {
    preview.setAttribute("open", false);
  });

  if (options.position === "follow") {
    // send the cursor position as the x and y coords to position the popup
    element.addEventListener("mousemove", (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      preview.setAttribute("parent", JSON.stringify(pos));
    });
  }
}

console.log("HYPEFOV LINK PREVIEWS >> running");

window.linkPreview = linkPreview;

export { linkPreview, LinkPreview };
