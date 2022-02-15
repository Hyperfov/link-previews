import { useRef, useEffect } from "react";
import { linkPreview } from "link-previews";

function LinkPreview(props) {
  const linkRef = useRef(null);

  // add a link preview to the element
  useEffect(() => {
    if (linkRef) {
      linkPreview(linkRef.current, {
        backend: "http://localhost:8787",
      });
    }
  });

  return (
    <a
      ref={linkRef}
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
}

export default LinkPreview;
