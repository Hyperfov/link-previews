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

Once you've run the above commands to set up the worker, you're ready to deploy it.

### CORS and caching config

There are a couple of environment variables you might want to add to the `wrangler.toml` file:

```
[vars]
CORS = "*"
CACHE_DURATION = 60000
```

`CORS` is the list of hosts you wish to allow. For example, if installing link previews on my sites `classicinterfaces.com` and `hyperfov.com`, I'd add:

```
[vars]
CORS = "https://classicinterfaces.com, https://hyperfov.com"
CACHE_DURATION = 60000
```

All other cross-origin requests would be denied. To allow all origins, use `"*"`.

`CACHE_DURATION` is how long in seconds each request should be cached by Cloudflare. If multiple clients make the same requests (e.g. multiple people visiting the same page), the worker would serve from the cache rather than re-requesting the linked pages every time. Note that the cache is only used when you deploy the worker to [a custom domain](https://developers.cloudflare.com/workers/platform/routes), rather than the default `.workers.dev` domain.

### Deploy worker

Run:

```
wrangler publish
```
