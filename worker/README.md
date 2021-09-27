# Link Preview Worker

This is a function that pulls the metadata from any given page, deployable as a Cloudflare Worker.

It takes requests with a `page` param:

```
http://localhost:8787/?page=https://classicinterfaces.com
```

and responds with the page's metadata:

```json
{
  "title": "Classic Interfaces",
  "description": "Classic user interfaces from 1980's and 1990's operating systems. Includes interfaces from MacOS System 6, 7, and Windows 3. MacPaint, Calculator, Control Panel, and many more. ",
  "image": "https://classicinterfaces.com/images/paint1/large.jpg"
}
```

## Development

To run the worker in development, first [install `wrangler`](https://developers.cloudflare.com/workers/get-started/guide#2-install-the-workers-cli) and [login to your Cloudflare account](https://developers.cloudflare.com/workers/get-started/guide#3-configure-the-workers-cli).

Create your config file by running:

```
wrangler init
```

then:

```
wrangler dev
```

The server should now be available at `http://localhost:8787`.

## Deployment

Run:

```
wrangler publish
```
