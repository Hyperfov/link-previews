import LinkPreview from "./components/LinkPreview";
import getElements from "./utils/getElements";
import { logMessage, logWarning } from "./utils/logMessage";
import {
  Props,
  Target,
  PreviewContent,
  Instance,
  LinkPreviewWindow,
} from "./types";

import tippy, { followCursor } from "tippy.js";
import * as Tippy from "tippy.js";
import { merge } from "lodash-es";

import "tippy.js/animations/shift-toward.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/animations/scale.css";
import "tippy.js/animations/perspective.css";

import basicTemplate from "./templates/basic";
import { defaultProps } from "./props";

customElements.define("link-preview", LinkPreview);

/**
 * Add a link preview to any element or set of elements. Adds the custom <link-preview> web component
 * wrapped in a popup to the DOM.
 *
 * @param target - a selector, element, or list of elements to add previews to
 * @param props - configuration object for the link previews
 */
function linkPreview(target: Target, props: Props): Instance[] | null {
  props = merge({}, defaultProps, props);

  if (!window.matchMedia("(any-hover: hover)").matches) {
    logMessage(
      "this device doesn't support hover events; will not add any previews"
    );
    return null;
  }

  if (!props.worker && props.fetch) {
    logWarning(
      "Missing `worker` in props, skipping. A worker url is required when `fetch` is true"
    );
    return null;
  }

  if (!props.template || props.template === "basic") {
    // if the user hasn't provided a template, add the default one to the DOM
    document.body.insertAdjacentHTML("afterbegin", basicTemplate());
    props.template = "#hyperfov-link-preview-template";
  }

  let elements = getElements(target);
  let instances: Instance[] = [];

  // add a link preview for each element
  for (const elt of elements) {
    if (
      !props.href &&
      !elt.hasAttribute("href") &&
      !elt.hasAttribute("xlink:href")
    ) {
      logWarning(
        "Element missing href, skipping. Add an href attribute to the element or pass through `href` in props."
      );
    } else {
      // parse the attributes of the element and init props
      const instProps = parseAttributesAndAmendProps(elt, props);

      // add a link-preview web component to the dom for this element
      const preview = document.createElement("link-preview");
      applyPropsToPreview(preview, instProps);
      document.body.appendChild(preview);

      // wrap the link-preview component in a tippy instance
      const tippyInstance = addWrappedPreviewToElt(elt, preview, instProps);

      const setProps = (newProps: Props) => {
        applyPropsToPreview(
          preview,
          merge({}, defaultProps, props, newProps) as Props
        );
        // update the tippy instance props
        if (newProps.tippy) tippyInstance.setProps({ ...newProps.tippy });
      };

      instances.push({
        setProps,
        tippy: tippyInstance,
      });
    }
  }
  return instances.length > 0 ? instances : null;
}

function applyPropsToPreview(preview: Element, props: Props) {
  if (props.href) {
    // verify href is a working url
    try {
      const url = new URL(props.href.toString());
      props.content
        ? (props.content.href = url.toString())
        : (props.content = { href: url.toString() });
    } catch {
      logMessage(`Unable to parse url ${props.href}`);
    }
  }

  // apply props as attributes on the link-preview element
  preview.setAttribute("content", JSON.stringify(props.content));
  if (props.template)
    preview.setAttribute("template", props.template.toString());
  if (props.worker) preview.setAttribute("worker", props.worker.toString());
  if (props.fetch) preview.setAttribute("fetch", props.fetch.toString());
}

/**
 * Parse the attributes of a DOM element and add them to a props object.
 *
 * @param elt - the element to parse attributes of
 * @param props - configuration object for the link previews
 */
function parseAttributesAndAmendProps(elt: Element, props: Props): Props {
  let instanceProps = { ...props };

  // get the attributes from the element and add to props
  for (const attribute of elt.attributes) {
    const attributeValue = elt.getAttribute(attribute.nodeName);
    if (attribute.nodeName === "href" || attribute.nodeName === "xlink:href") {
      try {
        const url = new URL(attributeValue!);
        // okay if this wipes out the prior href from props; href attribute takes precedence
        instanceProps.content
          ? (instanceProps.content.href = url.toString())
          : (instanceProps.content = { href: url.toString() });
      } catch {
        logMessage(`Unable to parse url ${props.href}`);
      }
    } else if (attribute.nodeName.includes("lp-")) {
      // try to parse the lp-* attributes and add them to props
      const attr = attribute.nodeName.replace("lp-", "").replace("xlink:", "");
      if (!instanceProps.content) instanceProps.content = {};
      // okay if these wipe out prior props; attributes take precedence
      instanceProps.content[attr as keyof PreviewContent] = attributeValue;
    }
  }

  return instanceProps;
}

/**
 * Wrap an element in a tippy instance with a link-preview element
 *
 * @param elt - the element to add the preview to
 * @param props - configuration object for the link previews
 */
function addWrappedPreviewToElt(
  elt: Element,
  preview: Element,
  props: Props
): Tippy.Instance {
  // init the tippy element
  const tippyInstance = tippy(elt, {
    content: preview,
    ...props.tippy,
    plugins: [followCursor],
    onShow: () => {
      preview.setAttribute("open", "true");
    },
    allowHTML: true,
  });

  return tippyInstance;
}

logMessage("running");

declare let window: LinkPreviewWindow;
window.linkPreview = linkPreview;

export { linkPreview, LinkPreview };
