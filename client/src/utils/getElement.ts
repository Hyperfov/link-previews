import { logError } from "./logMessage";

const getElement = (
  elt: String | HTMLElement | SVGElement
): HTMLElement | SVGElement | null => {
  let element = null;

  // try to get the element
  if (typeof elt === "string") {
    const res = document.querySelector(elt);
    if (res instanceof HTMLElement) {
      element = res;
    } else {
      logError(`could not access element ${elt}`);
    }
  } else if (elt instanceof HTMLElement) {
    element = elt;
  } else if (elt instanceof SVGElement) {
    element = elt;
  } else {
    logError(
      "unknown element type; must be one of String, HTMLElement, SVGElement"
    );
  }

  return element;
};

export default getElement;
