import LinkPreview from "./components/LinkPreview";
import getElement from "./utils/getElement";
import { logMessage, logError } from "./utils/logMessage";
import { Props, PreviewContent, Instance, LinkPreviewWindow } from "./types";

import tippy, { followCursor } from "tippy.js";
import * as _ from "lodash";

import "tippy.js/animations/shift-toward.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/animations/scale.css";
import "tippy.js/animations/perspective.css";

import basicTemplate from "./templates/basic";
import { defaultProps } from "./props";

customElements.define("link-preview", LinkPreview);

/**
 * Add a link preview to an <a> tag. Adds the custom <link-preview> element
 * and watches for hover events.
 *
 * @param elt - the element to add the link preview to
 * @param props - configuration for the link preview
 */
function linkPreview(
  elt: String | HTMLElement | SVGElement,
  props: Props
): Instance | null {
  props = _.merge({}, defaultProps, props);

  if (!window.matchMedia("(any-hover: hover)").matches) {
    logMessage(
      "this device doesn't support hover events; will not add any previews"
    );
    return null;
  }

  if (!props.backend && props.fetch) {
    logError("missing required backend url");
  }

  let element = getElement(elt);

  if (!element) {
    logError("element doesn't exist");
    return null;
  }

  // need at least an href to continue
  if (element.hasAttribute("href") || element.hasAttribute("xlink:href")) {
  } else {
    logError("element missing href");
    return null;
  }

  if (!props.template || props.template === "basic") {
    // if the user hasn't provided a template, add the default one to the DOM
    document.body.insertAdjacentHTML("afterbegin", basicTemplate());
    props.template = "#hyperfov-link-preview-template";
  }

  // get the attributes from the element and init props
  for (const attribute of element.attributes) {
    const attributeValue = element.getAttribute(attribute.nodeName);
    if (attribute.nodeName === "href" || attribute.nodeName === "xlink:href") {
      try {
        const url = new URL(attributeValue!);
        props.content
          ? (props.content.href = url.toString())
          : (props.content = { href: url.toString() });
      } catch {
        logMessage(`unable to parse url ${attributeValue}, skipping`);
      }
    } else if (attribute.nodeName.includes("lp-")) {
      const attr = attribute.nodeName.replace("lp-", "").replace("xlink:", "");
      if (!props.content) props.content = {};
      props.content[attr as keyof PreviewContent] = attributeValue;
    }
  }

  // add a link-preview element to the dom for this element
  const preview = document.createElement("link-preview");

  // set attributes on the link-preview element
  preview.setAttribute("content", JSON.stringify(props.content));
  if (props.template)
    preview.setAttribute("template", props.template.toString());
  if (props.backend) preview.setAttribute("backend", props.backend.toString());
  if (props.fetch) preview.setAttribute("fetch", props.fetch.toString());

  document.body.appendChild(preview);

  // init the tippy element
  const tippyInstance = tippy(element, {
    content: preview,
    ...props.tippy,
    plugins: [followCursor],
    onShow: () => {
      preview.setAttribute("open", "true");
    },
    allowHTML: true,
  });

  const setProps = (props: Props) => {
    // todo
  };

  // TODO: emit useful events that can be listened for
  return {
    setProps,
    tippy: tippyInstance,
  };
}

logMessage("running");

declare let window: LinkPreviewWindow;
window.linkPreview = linkPreview;

export { linkPreview, LinkPreview };
