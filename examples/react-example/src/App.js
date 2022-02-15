import "./App.css";
import { useState } from "react";
import LinkPreview from "./components/LinkPreview";

function App() {
  const [url, setUrl] = useState("https://matrix.org");
  const [idx, setIdx] = useState(1);

  const updateUrl = () => {
    const urls = [
      "https://matrix.org",
      "https://www.cloudflare.com/",
      "https://en.wikipedia.org",
    ];
    setUrl(urls[idx]);

    if (idx + 1 < urls.length) {
      setIdx(idx + 1);
    } else {
      setIdx(0);
    }
  };

  return (
    <div className="App">
      <h1>React link preview example</h1>
      <p>
        This is an example of using link previews with dynamically rendered
        content. Click <button onClick={updateUrl}>update url</button> to switch
        out the components's <code>href</code> and update the preview:{" "}
      </p>
      <p>
        <LinkPreview href={url}>This is a link to {url}</LinkPreview>
      </p>

      <div>
        <details>
          <summary>
            <b>
              The <code>LinkPreview</code> component
            </b>
          </summary>
          <p>
            The react component that wraps the <code>linkPreview</code>{" "}
            interface is quite simple; just pass the element's <code>ref</code>{" "}
            to the constructor. Any changes to the element's attributes are
            updated internally, no need to manually remove the preview element
            when the props change.
          </p>
          <pre>
            {`
function LinkPreview(props) {
    const linkRef = useRef(null);
    const [preview, setPreview] = useState(null);
    
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
      `}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default App;
