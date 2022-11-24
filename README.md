# Link Previews

When added to a webpage, hovering links displays a wikipedia-style dynamic page preview.

This package is composed of two parts:

- A javascript function `linkPreview` that can add a link preview web component to any `a` tag on your page.
- A Cloudflare Workers function that fetches and serves the links' meta information to the web component.

## Usage

### Deploy the worker

Follow the instructions in [the worker's docs](worker/README.md) to deploy the worker to Cloudflare Workers. Once complete you should have a url like `https://[something].workers.dev`, or a custom domain if you've opted to set one up.

### Add the script to your page

Follow the instructions in the [client's docs](client/README.md) to initialize link previews.

## Development

### Worker

Follow the directions to start the worker in [the worker's readme](../worker/README.md).

### Client

To run the client, enter the `client` directory and install the dependencies:

```
npm install
```

Then run the development server:

```
npm run dev
```

You should now be able to navigate to `localhost:9000` in the browser to try out the examples.

To build the client:

```
npm run build
```
