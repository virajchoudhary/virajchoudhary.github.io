import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const port = Number(process.env.PORT ?? 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  const requestPath = decodeURIComponent(
    new URL(request.url ?? "/", "http://localhost").pathname,
  );
  const safePath = normalize(requestPath).replace(/^([/\\])+/, "");
  const candidates = [
    join(root, safePath),
    join(root, safePath, "index.html"),
    join(root, `${safePath}.html`),
  ];

  let selected;
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) {
        selected = candidate;
        break;
      }
    } catch {
      // Try the next static-export path shape.
    }
  }

  if (!selected) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type":
      mimeTypes[extname(selected)] ?? "application/octet-stream",
  });
  createReadStream(selected).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static export available at http://127.0.0.1:${port}`);
});
