/**
 * HYPERFOV PAGE PREVIEWS
 *
 * This is a small script that can be configured to show a preview of a link
 * It's meant to be a minimal, framework-agnostic implementation that can
 * be added to any page.
 */

const defaultPreviewTemplate = `
<template id="hyperfov-link-preview-template">
<p>my template</p>
</template>
`;

/**
 * Custom component for link previews
 *
 * When added to the DOM, does the work of fetching, caching, and rendering the
 * link preview.
 */
class LinkPreview extends HTMLElement {
  static get observedAttributes() {
    return [
      "parent",
      "open",
      "template",
      "position",
      "url",
      "title",
      "description",
      "img",
      "fetchLink",
    ];
  }

  constructor() {
    super();

    // open the shadow dom
    this._shadow = this.attachShadow({ mode: "open" });

    // setup methods
    this.render = this.render.bind(this);
    this.retrievePage = this.retrievePage.bind(this);
    this.getAttrOrDefault = this.getAttrOrDefault.bind(this);

    // instantiate element with any passed attributes
    this.url = this.getAttrOrDefault("url", null);
    this.t = this.getAttrOrDefault("title", null);
    this.description = this.getAttrOrDefault("description", null);
    this.img = this.getAttrOrDefault("img", null);
    this.fetchLink = this.getAttrOrDefault(
      "fetchLink",
      true,
      (v) => v === "true"
    );
    this.parentPos = this.getAttrOrDefault("parent", null, (v) =>
      JSON.parse(v)
    );
    this.open = this.getAttrOrDefault("open", false, (v) => v === "true");
    this.template = this.getAttrOrDefault("template", null);
    this.position = this.getAttrOrDefault("position");

    this.retrievedPage = false;
    this.templateElt = null;

    this.render();
  }

  /**
   * Called when any attributes change on the element
   *
   * @param {string} name - changed attribute name
   */
  attributeChangedCallback(name) {
    if (name === "parent") {
      this.parentPos = this.getAttrOrDefault(name, null, (v) => JSON.parse(v));
    } else if (name === "open") {
      this.open = this.getAttrOrDefault(name, false, (v) => v === "true");
    } else if (name === "title") {
      // treating this one specially since its attribute doesn't match
      this.t = this.getAttrOrDefault(name, null);
    } else {
      // set any of the other attributes
      this[name] = this.getAttrOrDefault(name, null);
    }

    this.render();
  }

  render() {
    // only open if we've received a position
    if (this.parentPos && this.open) {
      if (!this.retrievedPage && this.fetchLink) {
        // we haven't fetched the link yet and are allowed to
        this.retrievePage();
      }

      // try to add the template, if it exists
      if (this.template && !this.templateElt) {
        this.templateElt = getElement(this.template)?.content;
        this._shadow.appendChild(this.templateElt.cloneNode(true));
      }

      // position and show the preview
      this.style.position = "absolute";
      this.style.pointerEvents = "none";

      const thisPos = this.getBoundingClientRect();

      const overlapsTop = this.parentPos.y - thisPos.height < 0;
      const overlapsBottom =
        this.parentPos.bottom + thisPos.height > window.innerHeight;

      if (
        (this.position === "below" && !overlapsBottom) ||
        (this.position === "above" && overlapsTop)
      ) {
        // position below text
        this.style.left = `${this.parentPos.x}px`;
        this.style.top = `${this.parentPos.bottom + window.scrollY}px`;
      } else if (
        (this.position === "above" && !overlapsTop) ||
        (this.position === "below" && overlapsBottom)
      ) {
        // position above text
        this.style.left = `${this.parentPos.x}px`;
        this.style.top = `${
          this.parentPos.y - thisPos.height + window.scrollY
        }px`;
      } else if (this.position === "follow") {
        // follow the cursor around
        this.style.left = `${this.parentPos.x}px`;
        this.style.top = `${this.parentPos.y + window.scrollY}px`;
      }

      this.style.opacity = 1;

      if (this.description && !this.descriptionElt) {
        // add the description
        this.descriptionElt = document.createElement("span");
        this.descriptionElt.id = "description";
        this.descriptionElt.setAttribute("slot", "description");
        this.descriptionElt.textContent = this.description;
        this.appendChild(this.descriptionElt);
      }

      if (this.t && !this.titleElt) {
        // add the title
        this.titleElt = document.createElement("span");
        this.titleElt.id = "title";
        this.titleElt.setAttribute("slot", "title");
        this.titleElt.textContent = this.t;
        this.appendChild(this.titleElt);
      }

      if (this.url && !this.urlElt) {
        // add the url
        this.urlElt = document.createElement("span");
        this.urlElt.id = "url";
        this.urlElt.setAttribute("slot", "url");
        this.urlElt.textContent = this.url;
        this.appendChild(this.urlElt);
      }
    } else if (this.parentPos && !this.open) {
      // hide the preview
      this.style.opacity = 0;
    }
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

function getElement(elt) {
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
}

/**
 * Add a link preview to an <a> tag. Adds the custom <link-preview> element
 * and watches for hover events.
 *
 * @param {string|HTMLElement} elt - the element to add the link preview to
 * @param {Object} opts - configuration for the link preview
 */
function linkPreview(elt, opts = {}) {
  const options = {
    title: null,
    description: null,
    img: null,
    url: null,
    fetchLink: true,
    position: "below",
    template: "#hyperfov-link-preview-template",
    ...opts,
  };
  let element = getElement(elt);

  if (!opts.template) {
    // if the user hasn't provided a template, verify that the default template exists
    const templateElt = document.querySelector(options.template);
    if (!(templateElt instanceof HTMLElement)) {
      // no default template exists; add the default template to the DOM
      const templateWrapper = document.createElement("div");
      templateWrapper.innerHTML = defaultPreviewTemplate;
      document.body.appendChild(templateWrapper);
    }
  }

  // TODO verify the element has a valid href
  // TODO watch the element for changes

  // add a link-preview element to the dom for this element
  const preview = document.createElement("link-preview");

  preview.setAttribute("position", options.position);

  if (options.url) preview.setAttribute("url", options.url);
  else preview.setAttribute("url", element.href);

  if (options.template) preview.setAttribute("template", options.template);
  if (options.description)
    preview.setAttribute("description", options.description);
  if (options.img) preview.setAttribute("img", options.img);
  if (options.title) preview.setAttribute("title", options.title);

  document.body.appendChild(preview);

  // watch for hover events on the element
  element.addEventListener("mouseover", () => {
    const pos = element.getBoundingClientRect();
    preview.setAttribute("parent", JSON.stringify(pos));
    preview.setAttribute("open", "true");
  });

  element.addEventListener("mouseout", () => {
    preview.setAttribute("open", false);
  });

  if (options.position === "follow") {
    // send the cursor position as the x and y coords to position the popup
    element.addEventListener("mousemove", (e) => {
      const pos = { x: e.clientX, y: e.clientY };
      preview.setAttribute("parent", JSON.stringify(pos));
    });
  }
}

console.log("HYPEFOV LINK PREVIEWS >> running");
