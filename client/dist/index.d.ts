declare module '@hyperfov/link-previews/components/LinkPreview' {
  export default LinkPreview;
  /**
   * Custom component for link previews
   *
   * When added to the DOM, does the work of fetching, caching, and rendering the
   * link preview.
   */
  class LinkPreview extends HTMLElement {
      static get observedAttributes(): string[];
      _shadow: ShadowRoot;
      /**
       * Fetch a page's data from the worker
       */
      retrievePage(): void;
      /**
       * Try and get an attribute value, or return the default
       *
       * @param {string} attr - the attribute to try and retrieve
       * @param {any} def - the default value if the attribute doesn't exist
       * @param {Function} - a transformation function called on the attribute if it exists
       * @returns the attribute value or default if it doesn't exist
       */
      getAttrOrDefault(attr: string, def: any, transform?: (v: any) => any): any;
      /**
       * Render the template, content and fetch from the worker if needed
       */
      renderContent(): void;
      /**
       * Remove all elements from the preview
       */
      clearContent(): void;
      /**
       * Add the template to the shadow DOM
       */
      renderTemplate(): void;
      /**
       * Add a text element if it hasn't been added already, and populate it's textContent
       * @param {string} name - the attribute name
       * @param {string} text - the textContent of the element
       */
      renderTextElement(name: string, text: string): void;
      /**
       * Add an image element if it hasn't been added already, and populate its src
       * @param {string} name - the attribute name (image or favicon)
       * @param {string} src - the src of the image
       */
      renderImageElement(name: string, src: string): void;
      fetchOnHover: any;
      fetch: any;
      open: any;
      worker: any;
      template: any;
      templateElt: any;
      elements: {};
      retrievedPage: boolean;
      content: any;
      contentRenderers: {
          title: {
              render: (title: any) => void;
          };
          description: {
              render: (desc: any) => void;
          };
          href: {
              render: (href: any) => void;
          };
          image: {
              render: (src: any) => void;
          };
          favicon: {
              render: (src: any) => void;
          };
      };
      /**
       * Called when any attributes change on the element
       *
       * @param {string} name - changed attribute name
       */
      attributeChangedCallback(name: string): void;
  }

}
declare module '@hyperfov/link-previews/index' {
  import LinkPreview from "@hyperfov/link-previews/components/LinkPreview";
  import { Props, Target, Instance } from "@hyperfov/link-previews/types";
  import "tippy.js/animations/shift-toward.css";
  import "tippy.js/animations/shift-away.css";
  import "tippy.js/animations/scale.css";
  import "tippy.js/animations/perspective.css";
  /**
   * Add a link preview to any element or set of elements. Adds the custom <link-preview> web component
   * wrapped in a popup to the DOM.
   *
   * @param target - a selector, element, or list of elements to add previews to
   * @param props - configuration object for the link previews
   */
  function linkPreview(target: Target, props: Props): Instance[] | null;
  export { linkPreview, LinkPreview };

}
declare module '@hyperfov/link-previews/props' {
  import { Props } from "@hyperfov/link-previews/types";
  export const defaultProps: Props;

}
declare module '@hyperfov/link-previews/templates/basic' {
  const basicTemplate: () => string;
  export { basicTemplate };

}
declare module '@hyperfov/link-previews/types' {
  import * as Tippy from "tippy.js";
  export interface PreviewContent {
      href?: String | null;
      title?: String | null;
      description?: String | null;
      image?: String | null;
      favicon?: String | null;
  }
  export type TemplateVariant = "basic";
  export interface Props {
      href?: String | null;
      content?: PreviewContent | null;
      worker?: String | null;
      fetch?: Boolean;
      fetchOnHover?: Boolean | null;
      template?: TemplateVariant | String | HTMLElement;
      tippy?: Partial<Tippy.Props>;
  }
  export interface Instance {
      setProps(props: Partial<Props>): void;
      tippy: Tippy.Instance;
  }
  export type Target = String | Element | Element[];
  export interface LinkPreviewWindow extends Window {
      linkPreview(elt: Target, props: Props): Instance[] | null;
  }

}
declare module '@hyperfov/link-previews/utils/getElements' {
  import { Target } from "@hyperfov/link-previews/types";
  const getElements: (elt: Target) => Element[];
  export default getElements;

}
declare module '@hyperfov/link-previews/utils/logMessage' {
  const logMessage: (msg: String) => void;
  const logWarning: (msg: String) => void;
  const logError: (msg: String) => void;
  export { logMessage, logWarning, logError };

}
declare module '@hyperfov/link-previews/utils/mergeDeep' {
  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  const mergeDeep: (target: any, ...sources: any[]) => Object;
  export { mergeDeep };

}
declare module '@hyperfov/link-previews' {
  import main = require('@hyperfov/link-previews/src/index');
  export = main;
}