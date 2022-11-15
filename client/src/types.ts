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
  content?: PreviewContent | null;
  backend?: String | null;
  fetch?: Boolean;
  template?: TemplateVariant | String | HTMLElement;
  tippy?: Partial<Tippy.Props>;
}

export interface Instance {
  setProps(props: Partial<Props>): void;
  tippy: Tippy.Instance;
}

export interface LinkPreviewWindow extends Window {
  linkPreview(
    elt: String | HTMLElement | SVGElement,
    props: Props
  ): Instance | null;
}
