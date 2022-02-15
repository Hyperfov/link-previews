<script>
  import LinkPreview from "./components/LinkPreview.svelte";

  let url = "https://matrix.org";
  let idx = 1;

  const updateUrl = () => {
    const urls = [
      "https://matrix.org",
      "https://www.cloudflare.com/",
      "https://en.wikipedia.org",
    ];
    url = urls[idx];

    if (idx + 1 < urls.length) {
      idx += 1;
    } else {
      idx = 0;
    }
  };
</script>

<main>
  <h1>Svelte link preview example</h1>
  <p>
    This is an example of using link previews with dynamically rendered content.
    Click <button on:click={updateUrl}>update url</button> to switch out the
    components's <code>href</code> and update the preview:
  </p>
  <p>
    <LinkPreview href={url}>This is a link to {url}</LinkPreview>
  </p>
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
  }

  p {
    margin: 2rem 0;
  }
</style>
