# Link Previews React example

This is an example of using link previews with dynamically rendered content.

Run it:

```
npm install
npm run start
```

The react component in this example that wraps the `linkPreview` interface is quite simple; just pass the element's `ref` to the constructor. Any changes to the element's attributes are updated internally, no need to manually remove the preview element when the component's props change.

```js
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
```
