/**
 * HYPERFOV PAGE PREVIEWS
 *
 * This is a small script that can be configured to show a preview of a link
 * It's meant to be a minimal, framework-agnostic implementation that can
 * be added to any page.
 */

/**
 * Custom component for link previews
 *
 * When added to the DOM, does the work of fetching, caching, and rendering the
 * link preview.
 */
class LinkPreview extends HTMLElement {
  static get observedAttributes() {
    return ["position", "open"];
  }

  constructor() {
    super();

    // open the shadow dom
    this._shadow = this.attachShadow({ mode: "open" });

    // setup methods
    this.render = this.render.bind(this);
    this.retrievePage = this.retrievePage.bind(this);
    this.createElement = this.createElement.bind(this);
    this.getAttrOrDefault = this.getAttrOrDefault.bind(this);

    // instantiate element with any passed attributes

    // these attributes are not watched; changing them after the link preview has
    // been added to the DOM will not have an effect on the element. If you want to
    // change any of these attributes, remove the element and re-instantiate
    this.href = this.getAttrOrDefault("href", null);
    this.t = this.getAttrOrDefault("title", null);
    this.description = this.getAttrOrDefault("desc", null);
    this.img = this.getAttrOrDefault("img", null);
    this.fetchLink = this.getAttrOrDefault(
      "fetchLink",
      true,
      (v) => v === "true"
    );

    // these attributes are watched; changing them changes the preview
    this.position = this.getAttrOrDefault("position", null, (v) =>
      JSON.parse(v)
    );
    this.open = this.getAttrOrDefault("open", false, (v) => v === "true");

    this.retrievedPage = false;
    this.render();
  }

  /**
   * Called when any attributes change on the element
   *
   * @param {string} name - changed attribute name
   */
  attributeChangedCallback(name) {
    if (name === "position") {
      this.position = this.getAttrOrDefault(name, null, (v) => JSON.parse(v));
      // update the position
      this.render();
    } else if (name === "open") {
      this.open = this.getAttrOrDefault(name, false, (v) => v === "true");
      // show or close accordingly
      this.render();
    }
    // else {
    //     this[name] = this.getAttrOrDefault(name, null);
    // }
  }

  render() {
    // only open if we've received a position
    if (this.position && this.open) {
      if (!this.retrievedPage && this.fetchLink) {
        // we haven't fetched the link yet and are allowed to
        this.retrievePage();
      }
      // TODO show the preview
    } else if (!this.open) {
      // TODO close the preview
    }
  }

  /**
   * Add a new element to the shadow dom
   *
   * @param {string} name - the tag name of the element to create
   * @param {string} cls - a class to add to the new element
   * @param {HTMLElement} parent - the parent to attach the new element to
   * @returns a new HTMLElement
   */
  createElement(name, cls, parent) {
    const elt = document.createElement(name);
    elt.classList.add(cls);
    if (parent) {
      parent.appendChild(elt);
    } else {
      this._shadow.appendChild(elt);
    }
    return elt;
  }

  retrievePage() {
    console.log("fetching");
    // TODO fetch page
  }

  /**
   * Try and get an attribute value, or return the default
   *
   * @param {string} attr - the attribute to try and retrieve
   * @param {any} def - the default value if the attribute doesn't exist
   * @param {Function} - a transformation function called on the attribute if it exists
   * @returns the attribute value or default if it doesn't exist
   */
  getAttrOrDefault(attr, def, transform = (v) => v) {
    if (this.hasAttribute(attr)) {
      try {
        const val = this.getAttribute(attr);
        return transform(val);
      } catch {
        console.error(
          `HYPERFOV LINK PREVIEWS >> could not parse attribute "${attr}" with value ${val}`
        );
      }
    }
    return def;
  }
}

customElements.define("link-preview", LinkPreview);

/**
 * Add a link preview to an <a> tag. Adds the custom <link-preview> element
 * and watches for hover events.
 *
 * @param {string|HTMLElement} elt - the element to add the link preview to
 * @param {Object} opts - configuration for the link preview
 */
function linkPreview(elt, opts) {
  const options = {
    href: null,
    title: null,
    description: null,
    img: null,
    fetchLink: true,
    followCursor: false,
    ...opts,
  };
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

  // TODO verify the element has a valid href
  // TODO watch the element for changes

  // add a link-preview element to the dom for this element
  const preview = document.createElement("link-preview");
  preview.setAttribute("href", element.href);
  document.body.appendChild(preview);

  // watch for hover events on the element
  element.addEventListener("mouseover", () => {
    const pos = element.getBoundingClientRect();
    preview.setAttribute("position", JSON.stringify(pos));
    preview.setAttribute("open", "true");
  });

  element.addEventListener("mouseout", () => {
    preview.setAttribute("open", false);
  });

  if (options.followCursor) {
    // send the cursor position as the x and y coords to position the popup
    element.addEventListener("mousemove", (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      preview.setAttribute("position", JSON.stringify(pos));
    });
  }
}

console.log("HYPEFOV LINK PREVIEWS >> running");
