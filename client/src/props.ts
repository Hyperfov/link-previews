import { Props } from "./types";

export const defaultProps: Props = {
  content: null,
  worker: null,
  fetch: true,
  fetchOnHover: true,
  template: "basic",
  tippy: {
    placement: "bottom-start",
    animation: "shift-toward",
  },
};
