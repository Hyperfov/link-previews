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
    content: {
      title: null,
      description: null,
      image: null,
      href: null,
    },
    backend: null,
    fetch: true,
    position: "below",
    template: "basic",
    ...opts,
  };

  if (!window.matchMedia("(any-hover: hover)").matches) {
    logMessage(
      "this device doesn't support hover events; will not any previews"
    );
    return;
  }

  if (!options.backend && options.fetch) {
    logError("missing backend url");
  }

  let element = getElement(elt);

  if (element.hasAttribute("href") || element.hasAttribute("xlink:href")) {
    // ok, the element has an href
  } else {
    logError("element missing href");
  }

  if (!opts.template || options.template === "basic") {
    // if the user hasn't provided a template, add the default one to the DOM
    document.body.insertAdjacentHTML("afterbegin", basicTemplate());
    options.template = "#hyperfov-link-preview-template";
  }
  // add a link-preview element to the dom for this element
  const preview = document.createElement("link-preview");

  // watch the element for attribute changes and pass through to preview component
  const observer = new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      if (
        mutation.attributeName === "href" ||
        mutation.attributeName === "xlink:href"
      ) {
        const attrValue = element.getAttribute(mutation.attributeName);
        if (!new RegExp(/https?:\/\//g).test(attrValue)) {
          // the href is relative; prepend the site's hostname
          const url = new URL(window.location);
          url.pathname = attrValue;
          options.content["href"] = url.href;
        } else {
          options.content["href"] = attrValue;
        }
        preview.setAttribute("content", JSON.stringify(options.content));
      } else if (mutation.attributeName.includes("lp-")) {
        // watch for any attributes lp-*
        const attr = mutation.attributeName.replace("lp-", "");
        const attrValue = element.getAttribute(mutation.attributeName);
        options.content[attr] = attrValue;
        preview.setAttribute("content", JSON.stringify(options.content));
      }
    }
    // TODO: when the element is removed from the DOM, delete the preview and observer
  });
  observer.observe(element, { attributes: true });

  if (options.template) preview.setAttribute("template", options.template);
  if (options.backend) preview.setAttribute("backend", options.backend);
  if (options.position) preview.setAttribute("position", options.position);
  if (options.fetch) preview.setAttribute("fetch", options.fetch);

  // get the attributes from the element
  for (const attribute of element.attributes) {
    if (attribute.nodeName === "href" || attribute.nodeName === "xlink:href") {
      if (!new RegExp(/https?:\/\//g).test(attribute.nodeValue)) {
        // the href is relative; prepend the site's hostname
        const url = new URL(window.location);
        url.pathname = attribute.nodeValue;
        options.content["href"] = url.href;
      } else {
        options.content["href"] = attribute.nodeValue;
      }
    } else {
      const attr = attribute.nodeName.replace("lp-", "").replace("xlink:", "");
      options.content[attr] = attribute.nodeValue;
    }
  }
  preview.setAttribute("content", JSON.stringify(options.content));

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

  // TODO: emit useful events that can be listened for
  return preview;
}

logMessage("running");

export { linkPreview, LinkPreview };

window.linkPreview = linkPreview;
