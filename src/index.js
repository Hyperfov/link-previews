import LinkPreview from "./LinkPreview.wc.svelte";
import Interior from "./Interior.svelte";
import Wrapper from "./Wrapper.svelte";

import { btoa } from "abab";

const defaultStyles = {
  border: "1px solid black",
  backgroundColor: "white",
  borderRadius: "6px",
};

window.setPagePreviews = function (styles = defaultStyles) {
  const pageATags = [...document.getElementsByTagName("a")];

  for (const a of pageATags) {
    // replace the tags with link preview components
    a.outerHTML = `<link-preview styles=${btoa(
      JSON.stringify(styles)
    )} linkcontent="${a.text}" href="${a.href}"></link-preview>`;
  }
};

export { LinkPreview, Interior, Wrapper };
