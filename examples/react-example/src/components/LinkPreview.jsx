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
        ...props.config,
      })[0];
      setPreview(preview);
    }
  }, [linkRef]);

  // we have to manually update props when they change
  useEffect(() => {
    if (linkRef && preview) {
      preview.setProps(props.config);
    }
  }, [props.config]);

  return (
    <a
      ref={linkRef}
      href={props.config.content.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
}

export default LinkPreview;
