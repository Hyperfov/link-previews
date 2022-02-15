import "./App.css";
import { useState } from "react";
import LinkPreview from "./components/LinkPreview";

function App() {
  const [url, setUrl] = useState("https://matrix.org");
  const [idx, setIdx] = useState(1);

  const updateUrl = () => {
    const urls = [
      "https://matrix.org",
      "https://ipfs.org",
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
      <LinkPreview href={url}>this is a link to {url}</LinkPreview>
      <button onClick={updateUrl}>Update url</button>
    </div>
  );
}

export default App;
