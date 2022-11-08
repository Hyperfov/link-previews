import getElement from "../utils/getElement";

import { logError } from "../utils/logMessage";

/**
 * Custom component for link previews
 *
 * When added to the DOM, does the work of fetching, caching, and rendering the
 * link preview.
 */
class LinkPreview extends HTMLElement {
  static get observedAttributes() {
    return ["parent", "open", "template", "fetch", "backend", "content"];
  }

  constructor() {
    super();

    // open the shadow dom
    this._shadow = this.attachShadow({ mode: "open" });

    // setup methods
    this.render = this.render.bind(this);
    this.retrievePage = this.retrievePage.bind(this);
    this.getAttrOrDefault = this.getAttrOrDefault.bind(this);
    this.setContent = this.setContent.bind(this);

    // instantiate element with any passed attributes
    this.setContent();

    this.parentPos = this.getAttrOrDefault("parent", null, (v) =>
      JSON.parse(v)
    );
    this.content = this.getAttrOrDefault("content", {}, (v) => JSON.parse(v));
    this.backend = this.getAttrOrDefault("backend", null);
    this.template = this.getAttrOrDefault("template", null);

    this.templateElt = null;
    this.elements = {};
    this.retrievedPage = false;

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
    } else if (name === "fetch") {
      this.fetch = this.getAttrOrDefault(name, true, (v) => v === "true");
    } else if (name === "content") {
      const newCont = this.getAttrOrDefault(name, null, (v) => JSON.parse(v));
      if (newCont?.href !== this.content?.href) {
        this.setContent();
      }
      this.content = newCont;
    } else {
      // set any of the other attributes
      this[name] = this.getAttrOrDefault(name, null);
    }

    this.render();
  }

  /**
   * Set or reset the preview's data from its attributes
   */
  setContent() {
    this.content = this.getAttrOrDefault("content", null, (v) => JSON.parse(v));

    // remove any existing elements
    for (const elt in this.elements) {
      this.removeChild(this.elements[elt]);
      delete this.elements[elt];
    }

    this.retrievedPage = false;
  }

  /**
   * Add the element to the DOM with any data we've received from the worker
   */
  render() {
    if (
      !this.retrievedPage &&
      this.fetch &&
      this.backend &&
      this.content.href &&
      this.open
    ) {
      // we haven't fetched the link yet and should
      this.retrievePage();
    }

    // try to add the template, if it exists
    if (this.template && !this.templateElt) {
      this.templateElt = getElement(this.template)?.content;
      this._shadow.appendChild(this.templateElt.cloneNode(true));
    }

    for (const attr in this.content) {
      if (this.content[attr] && !this.elements[attr]) {
        // add the element
        const element =
          attr === "image" || attr === "favicon"
            ? document.createElement("img")
            : document.createElement("span");

        element.id = `lp-${attr}`;
        element.setAttribute("slot", `lp-${attr}`);

        // set the content and add to shadow dom
        if (attr !== "image" && attr !== "favicon") {
          element.textContent = this.content[attr];
          this.appendChild(element);
        } else {
          const image = new Image();
          image.src = this.content.image;
          image.onload = (e) => {
            element.src = image.src;
            this.appendChild(element);
            // re-render to adjust position with new height if necessary
            this.render();
          };
        }
        // TODO set up some sort of set event
        this.elements[attr] = element;
      } else if (
        (this.elements[attr] &&
          this.elements[attr]?.textContent !== this.content[attr]) ||
        (this.elements[attr] && this.elements[attr]?.src !== this.content[attr])
      ) {
        if (attr !== "image" && attr !== "favicon")
          this.elements[attr].textContent = this.content[attr];
        else this.elements[attr].src = this.content[attr];
      }
      // TODO emit some sort of update event
    }
  }

  /**
   * Fetch a page's data from the worker
   */
  retrievePage() {
    this.retrievedPage = true;
    fetch(`${this.backend}/?page=${this.content?.href}`).then((res) => {
      if (res.ok)
        res.json().then((data) => {
          // populate the data only if it doesn't already exist
          for (const attr in data) {
            if (!this.content[attr]) {
              this.content[attr] = data[attr];
            }
          }
          this.render();
        });
    });
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
        logError(`could not parse attribute "${attr}" with value ${val}`);
      }
    }
    return def;
  }
}

export default LinkPreview;
