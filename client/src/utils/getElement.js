const getElement = (elt) => {
  let element = null;

  // try to get the element
  if (typeof elt === "string") {
    const res = document.querySelector(elt);
    if (res instanceof HTMLElement) {
      element = res;
    } else {
      console.error(
        `HYPERFOV LINK PREVIEWS >> could not access element ${elt}`
      );
    }
  } else if (elt instanceof HTMLElement) {
    element = elt;
  } else {
    console.error(
      "HYPERFOV LINK PREVIEWS >> unknown element type; must be a string or HTMLElement"
    );
  }

  return element;
};

export default getElement;
