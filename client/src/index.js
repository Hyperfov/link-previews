import LinkPreview from "./components/LinkPreview";
import getElement from "./utils/getElement";
import { logMessage, logError } from "./utils/logMessage";

import tippy, { followCursor } from "tippy.js";

import "tippy.js/animations/shift-toward.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/animations/scale.css";
import "tippy.js/animations/perspective.css";

import basicTemplate from "./templates/basic";

customElements.define("link-preview", LinkPreview);

/**
 * Add a link preview to an <a> tag. Adds the custom <link-preview> element
 * and watches for hover events.
 *
 * @param {string|HTMLElement} elt - the element to add the link preview to
 * @param {Object} props - configuration for the link preview
 */
function linkPreview(elt, props = {}) {
  const options = {
    content: {
      title: null,
      description: null,
      image: null,
      href: null,
    },
    backend: null,
    fetch: true,
    tippyProps: {
      placement: "bottom-start",
      followCursor: false,
      animation: "shift-toward",
    },
    template: "basic",
    ...props,
  };

  if (!window.matchMedia("(any-hover: hover)").matches) {
    logMessage(
      "this device doesn't support hover events; will not add any previews"
    );
    return;
  }

  if (!options.backend && options.fetch) {
    logError("missing backend url");
  }

  let element = getElement(elt);

  // need at least an href to continue
  if (element.hasAttribute("href") || element.hasAttribute("xlink:href")) {
  } else {
    logError("element missing href");
  }

  if (!opts.template || options.template === "basic") {
    // if the user hasn't provided a template, add the default one to the DOM
    document.body.insertAdjacentHTML("afterbegin", basicTemplate());
    options.template = "#hyperfov-link-preview-template";
  }

  // helper function to parse attributes and apply their values to the options object
  const parseAttribute = (attributeName) => {
    let optionsChanged = false;

    const attributeValue = element.getAttribute(attributeName);
    if (attributeName === "href" || attributeName === "xlink:href") {
      if (!new RegExp(/https?:\/\//g).test(attributeValue)) {
        // the href is relative; prepend the site's hostname
        const url = new URL(window.location);
        url.pathname = attributeValue;
        options.content["href"] = url.href;
      } else {
        options.content["href"] = attributeValue;
      }
      optionsChanged = true;
    } else if (attributeName.includes("lp-")) {
      const attr = attributeName.replace("lp-", "").replace("xlink:", "");
      options.content[attr] = attributeValue;
      optionsChanged = true;
    }

    return optionsChanged;
  };

  // get the attributes from the element and init options
  for (const attribute of element.attributes) {
    parseAttribute(attribute.nodeName);
  }

  // add a link-preview element to the dom for this element
  const preview = document.createElement("link-preview");

  preview.setAttribute("content", JSON.stringify(options.content));
  if (options.template) preview.setAttribute("template", options.template);
  if (options.backend) preview.setAttribute("backend", options.backend);
  if (options.fetch) preview.setAttribute("fetch", options.fetch);

  document.body.appendChild(preview);

  const tippyElt = tippy(element, {
    content: preview,
    ...options.tippyProps,
    plugins: [followCursor],
    onShow: () => {
      preview.setAttribute("open", true);
    },
    allowHTML: true,
  });

  // watch the element for attribute changes and pass through to preview component
  const observer = new MutationObserver((mutations, observer) => {
    let optionsChanged = false;
    for (const mutation of mutations) {
      let optionsChangedThisMutation = parseAttribute(mutation.attributeName);
      if (!optionsChanged && optionsChangedThisMutation) optionsChanged = true;
    }

    // if any options changed, we need to update the preview and tippy instance
    if (optionsChanged) {
      preview.setAttribute("content", JSON.stringify(options.content));
      // update the tippy props that may have changed
      tippyElt.setProps({
        placement: options.placement,
        followCursor: options.follow || options.follow === "true",
      });
    }
    // TODO: when the element is removed from the DOM, delete the preview and observer
  });
  observer.observe(element, { attributes: true });

  // TODO: emit useful events that can be listened for
  return preview;
}

logMessage("running");

export { linkPreview, LinkPreview };

window.linkPreview = linkPreview;
