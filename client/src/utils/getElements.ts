import { logError } from "./logMessage";

import { Target } from "../types";

const getElements = (elt: Target): Element[] => {
  if (typeof elt === "string") {
    const res = document.querySelectorAll(elt);
    return [...res];
  } else if (elt instanceof Element) {
    return [elt];
  } else {
    logError("unknown element type; must be one of String, Element, Element[]");
    return [];
  }
};

export default getElements;
