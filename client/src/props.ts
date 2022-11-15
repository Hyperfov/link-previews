import { Props } from "./types";

export const defaultProps: Props = {
  content: null,
  backend: null,
  fetch: true,
  template: "basic",
  tippy: {
    placement: "bottom-start",
    animation: "shift-toward",
  },
};
