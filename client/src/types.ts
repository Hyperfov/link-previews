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
