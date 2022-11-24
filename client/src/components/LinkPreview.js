import getElements from "../utils/getElements";

import { logError, logMessage } from "../utils/logMessage";

/**
 * Custom component for link previews
 *
 * When added to the DOM, does the work of fetching, caching, and rendering the
 * link preview.
 */
class LinkPreview extends HTMLElement {
  static get observedAttributes() {
    return ["open", "template", "fetch", "fetch-on-open", "worker", "content"];
  }

  constructor() {
    super();

    // open the shadow dom
    this._shadow = this.attachShadow({ mode: "open" });

    // setup methods
    this.retrievePage = this.retrievePage.bind(this);
    this.getAttrOrDefault = this.getAttrOrDefault.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.clearContent = this.clearContent.bind(this);

    this.renderTemplate = this.renderTemplate.bind(this);
    this.renderTextElement = this.renderTextElement.bind(this);
    this.renderImageElement = this.renderImageElement.bind(this);

    this.fetchOnHover = this.getAttrOrDefault(
      "fetch-on-hover",
      true,
      (v) => v === "true"
    );
    this.fetch = this.getAttrOrDefault("fetch", true, (v) => v === "true");
    this.open = this.getAttrOrDefault("open", false, (v) => v === "true");
    this.worker = this.getAttrOrDefault("worker", null);
    this.template = this.getAttrOrDefault("template", null);

    this.templateElt = null;
    this.elements = {};

    this.retrievedPage = false;

    // instantiate element with any passed attributes
    this.content = this.getAttrOrDefault("content", null, (v) => JSON.parse(v));
    this.renderContent();

    this.contentRenderers = {
      title: {
        render: (title) => this.renderTextElement("title", title),
      },
      description: {
        render: (desc) => this.renderTextElement("description", desc),
      },
      href: {
        render: (href) => this.renderTextElement("href", href),
      },
      image: {
        render: (src) => this.renderImageElement("image", src),
      },
      favicon: {
        render: (src) => this.renderImageElement("favicon", src),
      },
    };
  }

  /**
   * Called when any attributes change on the element
   *
   * @param {string} name - changed attribute name
   */
  attributeChangedCallback(name) {
    if (name === "open") {
      this.open = this.getAttrOrDefault(name, false, (v) => v === "true");
    } else if (name === "fetch-on-hover") {
      this.fetchOnHover = this.getAttrOrDefault(
        name,
        true,
        (v) => v === "true"
      );
    } else if (name === "fetch") {
      this.fetch = this.getAttrOrDefault(name, true, (v) => v === "true");
    } else if (name === "content") {
      const newCont = this.getAttrOrDefault(name, null, (v) => JSON.parse(v));
      if (newCont?.href !== this.content?.href) {
        // if the href has changed, wipe out the content and refetch
        this.clearContent();
      }
      this.content = newCont;
    } else {
      // set any of the other attributes
      this[name] = this.getAttrOrDefault(name, null);
    }

    this.renderContent();
  }

  /**
   * Remove all elements from the preview
   */
  clearContent() {
    for (const elt in this.elements) {
      try {
        this.removeChild(this.elements[elt]);
      } catch (e) {
        // might fail if the element wasn't added because it's missing data
      }
      delete this.elements[elt];
    }
    this.retrievedPage = false;
  }

  /**
   * Render the template, content and fetch from the worker if needed
   */
  renderContent() {
    if (!this.templateElt) {
      this.renderTemplate();
    }

    if (
      this.fetch &&
      this.worker &&
      !this.retrievedPage &&
      this.content?.href &&
      (!this.fetchOnHover || this.open)
    ) {
      // we should fetch now
      this.retrievePage();
      // TODO: render some placeholder here for anything that's not already
      // in the content object
    }

    for (const attr in this.content) {
      this.contentRenderers[attr]?.render(this.content[attr]);
    }
  }

  /**
   * Add a text element if it hasn't been added already, and populate it's textContent
   * @param {string} name - the attribute name
   * @param {string} text - the textContent of the element
   */
  renderTextElement(name, text) {
    let elt = this.elements[name];

    if (!elt) {
      // we don't have the element added yet, add it now
      elt = document.createElement("span");
      elt.id = `lp-${name}`;
      elt.setAttribute("slot", `lp-${name}`);
      this.appendChild(elt);
      this.elements[name] = elt;
    }

    // set the new text
    elt.textContent = text;
  }

  /**
   * Add an image element if it hasn't been added already, and populate its src
   * @param {string} name - the attribute name (image or favicon)
   * @param {string} src - the src of the image
   */
  renderImageElement(name, src) {
    let elt = this.elements[name];

    if (!elt) {
      // we don't have the element added yet, add it now
      elt = document.createElement("img");
      elt.id = `lp-${name}`;
      elt.setAttribute("slot", `lp-${name}`);

      const image = new Image();
      image.src = src;
      image.onload = () => {
        elt.src = image.src;
        this.appendChild(elt);
      };
      this.elements[name] = elt;
    }

    // set the new src
    const image = new Image();
    image.src = src;
    image.onload = () => {
      elt.src = image.src;
    };
  }

  /**
   * Add the template to the shadow DOM
   */
  renderTemplate() {
    // try to add the template, if it exists
    if (this.template && !this.templateElt) {
      const templateElt = getElements(this.template);
      if (templateElt) {
        this.templateElt = templateElt[0].content;
        this._shadow.appendChild(this.templateElt.cloneNode(true));
      }
      // TODO: do something if the template is missing
    }
  }

  /**
   * Fetch a page's data from the worker
   */
  retrievePage() {
    this.retrievedPage = true;
    logMessage(`Getting: ${this.content?.href}`);
    fetch(`${this.worker}/?page=${this.content?.href}`).then((res) => {
      if (res.ok)
        res.json().then((data) => {
          // populate the data only if it doesn't already exist
          for (const attr in data) {
            if (!this.content[attr]) {
              this.content[attr] = data[attr];
            }
          }
          this.renderContent();
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
