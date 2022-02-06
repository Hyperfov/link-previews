import getElement from "../utils/getElement";

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
      "fetch",
      "backend",
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
    this.fetch = this.getAttrOrDefault("fetch", true, (v) => v === "true");
    this.open = this.getAttrOrDefault("open", false, (v) => v === "true");

    this.parentPos = this.getAttrOrDefault("parent", null, (v) =>
      JSON.parse(v)
    );
    this.backend = this.getAttrOrDefault("backend", null);
    this.template = this.getAttrOrDefault("template", null);
    this.position = this.getAttrOrDefault("position", null);

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
    } else if (name === "fetch") {
      this.fetch = this.getAttrOrDefault(name, true, (v) => v === "true");
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
      if (!this.retrievedPage && this.fetch && this.backend) {
        // we haven't fetched the link yet and should
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
        // offset by the height of the cursor (approximate)
        this.style.top = `${this.parentPos.y + window.scrollY + 15}px`;
      }

      // small animation
      this.style.transition = "0.2s opacity ease-in";
      this.style.opacity = 1;

      if (this.description && !this.descriptionElt) {
        // add the description
        this.descriptionElt = document.createElement("span");
        this.descriptionElt.id = "description";
        this.descriptionElt.setAttribute("slot", "description");
        this.descriptionElt.textContent = this.description;
        this.appendChild(this.descriptionElt);

        // indicate that there's a description
        this._shadow.querySelector("div")?.classList.add("has-description");
      } else if (
        this.descriptionElt &&
        this.description !== this.descriptionElt.textContent
      ) {
        this.descriptionElt.textContent = this.description;
      }

      if (this.t && !this.titleElt) {
        // add the title
        this.titleElt = document.createElement("span");
        this.titleElt.id = "title";
        this.titleElt.setAttribute("slot", "title");
        this.titleElt.textContent = this.t;
        this.appendChild(this.titleElt);

        // indicate that there's a title
        this._shadow.querySelector("div")?.classList.add("has-title");
      } else if (this.titleElt && this.t !== this.titleElt.textContent) {
        this.titleElt.textContent = this.t;
      }

      if (this.url && !this.urlElt) {
        // add the url
        this.urlElt = document.createElement("span");
        this.urlElt.id = "url";
        this.urlElt.setAttribute("slot", "url");
        this.urlElt.textContent = this.url;
        this.appendChild(this.urlElt);
        // indicate that there's a url
        this._shadow.querySelector("div")?.classList.add("has-url");
      } else if (this.urlElt && this.url !== this.urlElt.textContent) {
        this.urlElt.textContent = this.url;
      }

      if (this.img && !this.imgElt) {
        // add the image
        this.imgElt = document.createElement("img");
        this.imgElt.id = "img";
        this.imgElt.setAttribute("slot", "image");
        this.imgElt.src = this.img;
        this.appendChild(this.imgElt);
        // indicate that there's an image
        this._shadow.querySelector("div")?.classList.add("has-image");
      } else if (this.imgElt && this.img !== this.imgElt.src) {
        this.imgElt.src = this.img;
      }
    } else if (this.parentPos && !this.open) {
      // hide the preview
      this.style.opacity = 0;
    }
  }

  retrievePage() {
    this.retrievedPage = true;

    fetch(`${this.backend}/?page=${this.url}`).then((res) => {
      if (res.ok)
        res.json().then((data) => {
          // populate the data only if it doesn't already exist
          if (data.title && !this.t) this.t = data.title;
          if (data.description && !this.description)
            this.description = data.description;
          if (data.image && !this.img) this.img = data.image;
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
        console.error(
          `HYPERFOV LINK PREVIEWS >> could not parse attribute "${attr}" with value ${val}`
        );
      }
    }
    return def;
  }
}

export default LinkPreview;
