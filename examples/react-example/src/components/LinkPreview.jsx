import { useRef, useEffect, useState } from "react";
import { linkPreview } from "link-previews";

function LinkPreview(props) {
  const linkRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // add a link preview to the element
  useEffect(() => {
    if (linkRef && !preview) {
      const preview = linkPreview(linkRef.current, {
        worker: "http://localhost:8787",
      })[0];
      setPreview(preview);
    }
  }, [preview, linkRef]);

  // we have to manually update props when the href changes
  useEffect(() => {
    if (linkRef && preview) {
      preview.setProps({ href: props.href });
    }
  }, [props.href]);

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
