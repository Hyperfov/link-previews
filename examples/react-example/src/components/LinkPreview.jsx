import { useRef, useEffect, useState } from "react";
import { linkPreview } from "link-previews";

function LinkPreview(props) {
  const linkRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // add a link preview to the element
  useEffect(() => {
    if (linkRef && !preview) {
      const preview = linkPreview(linkRef.current, {
        backend: "http://localhost:8787",
      });
      setPreview(preview);
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
