import "./App.css";
import { useRef, useEffect } from "react";
import { linkPreview } from "link-previews";

function App() {
  const linkRef = useRef(null);
  useEffect(() => {
    if (linkRef) {
      linkPreview(linkRef.current, {
        backend: "http://localhost:8787",
      });
    }
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          ref={linkRef}
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
