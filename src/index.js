import LinkPreview from "./LinkPreview.wc.svelte";
import Interior from "./Interior.svelte";
import Wrapper from "./Wrapper.svelte";

import { utf8ToB64 } from "./utils/encodeDecode";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUWXYZ",
  10
);

const defaultLinkGetter = () => {
  return document.getElementsByTagName("a");
};

window.setPagePreviews = async (options = {}) => {
  options = {
    workerUrl: "",
    styles: null,
    fetchOn: "hover",
    getLinks: defaultLinkGetter,
    assignStyles: () => null,
    assignPositions: () => "below",
    ...options,
  };

  const pageATags = options.getLinks();

  // add link previews for all links
  for (let a of pageATags) {
    const urlKey = `${utf8ToB64(a.href)}-preview-data`;

    // storing the url and where the data will go after fetched
    localStorage.setItem(urlKey, null);

    const shadowId = nanoid();
    const position = options.assignPositions(a) || "below";

    // add preview component
    const linkElt = document.createElement("link-preview");
    linkElt.setAttribute("id", shadowId);
    linkElt.setAttribute("href", a.href);
    linkElt.setAttribute("followCursor", position === "cursor");
    document.body.appendChild(linkElt);

    const shadow = document.getElementById(shadowId);
    // some convenience functions
    let fetching = false;

    const getPreviewData = async () => {
      const storedData = localStorage.getItem(urlKey);

      if (storedData === "null" && !fetching) {
        fetching = true;
        shadow.setAttribute("fetching", true);

        const worker = new URL(options.workerUrl);
        worker.searchParams.append("page", a.href);
        const res = await fetch(worker);

        if (res.ok) {
          const data = await res.json();
          shadow.setAttribute("data", utf8ToB64(JSON.stringify(data)));
          localStorage.setItem(urlKey, JSON.stringify(data));
        }
        shadow.setAttribute("fetching", false);
        fetching = false;
      } else if (storedData !== "null") {
        shadow.setAttribute("data", utf8ToB64(storedData));
      }
    };

    if (options.fetchOn === "load") {
      getPreviewData();
    }

    a.addEventListener("mouseover", () => {
      if (options.fetchOn === "hover") {
        getPreviewData();
      }
      const pos = a.getBoundingClientRect();
      shadow.setAttribute("position", utf8ToB64(JSON.stringify(pos)));
    });

    if (position === "cursor") {
      a.addEventListener("mousemove", (e) => {
        const pos = {
          x: e.clientX,
          y: e.clientY,
        };
        shadow.setAttribute("position", utf8ToB64(JSON.stringify(pos)));
      });
    }

    a.addEventListener("mouseout", () => {
      shadow.setAttribute("position", null);
    });

    // get the styles either from the result of assigning styles or default
    const styles = options.assignStyles(a) || options.styles;

    if (styles) {
      const styleRules = [];

      // copy the relevant styles over
      for (const rule of styles?.rules) {
        if (rule.selectorText.indexOf(".hyperfov") !== -1) {
          styleRules.push(rule.cssText);
        }
      }

      // add the id to any user-defined styles so they have precedence
      const thisRuleset = [...styleRules].map(
        (r) => `#${shadowId}-sub * ${r}\n#${shadowId}-sub > ${r}`
      );

      // add the relevant styles to the shadow dom
      const shadowStyle = document.createElement("style");
      shadowStyle.innerHTML = thisRuleset.join("\n");
      shadow.shadowRoot.appendChild(shadowStyle);
    }
  }
};

export { LinkPreview, Interior, Wrapper };
