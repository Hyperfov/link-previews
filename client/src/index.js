import LinkPreview from "./components/LinkPreview";
import getElement from "./utils/getElement";
import { logMessage, logError } from "./utils/logMessage";

import basicTemplate from "./templates/basic";

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
    template: "basic",
    ...opts,
  };

  if (!options.backend && options.fetchLink) {
    logError("missing backend url");
  }

  let element = getElement(elt);

  if (!opts.template || options.template === "basic") {
    // if the user hasn't provided a template, add the default one
    document.body.insertAdjacentHTML("afterbegin", basicTemplate());
    options.template = "#hyperfov-link-preview-template";
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

logMessage("running");

const linkPreviewTemplates = { basicTemplate };

export { linkPreview, LinkPreview, linkPreviewTemplates };

window.linkPreview = linkPreview;
