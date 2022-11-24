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
        <LinkPreview
          config={{ content: { href: url }, tippy: { followCursor: true } }} // pass link preview props here
        >
          This is a link to {url}
        </LinkPreview>
      </p>
    </div>
  );
}

export default App;
