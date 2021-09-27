import LinkPreview from "./LinkPreview.wc.svelte";
import Interior from "./Interior.svelte";
import Wrapper from "./Wrapper.svelte";

import { btoa } from "abab";
import { nanoid } from "nanoid";

const defaultLinkGetter = () => {
  return document.getElementsByTagName("a");
};

window.setPagePreviews = function (options = {}) {
  options = {
    workerUrl: "",
    styles: null,
    getLinks: defaultLinkGetter,
    assignStyles: (elt) => null,
    ...options,
  };

  const pageATags = [...options.getLinks()];

  // get the positions of all the links
  for (const a of pageATags) {
    const aPos = a.getBoundingClientRect();

    const shadowId = nanoid();

    // add preview component to the element
    a.innerHTML += `<link-preview id="${shadowId}" position="${btoa(
      JSON.stringify(aPos)
    )}" worker=${btoa(options.workerUrl)} href="${a.href}"></link-preview>`;

    // get the styles either from the result of assigning styles or default
    const styles = options.assignStyles(a) || options.styles;
    const styleRules = [];

    // copy the relevant styles over
    for (const rule of styles?.rules) {
      if (rule.selectorText.indexOf(".hyperfov") !== -1) {
        styleRules.push(rule.cssText);
      }
    }

    // add the id to any user-defined styles so they have precedence
    const thisRuleset = [...styleRules].map((r) => `#${shadowId}-sub * ${r}`);

    const shadow = document.getElementById(shadowId).shadowRoot;

    // add the relevant styles to the shadow dom
    const shadowStyle = document.createElement("style");
    shadowStyle.innerHTML = thisRuleset.join("\n");
    shadow.appendChild(shadowStyle);
  }
};

export { LinkPreview, Interior, Wrapper };
