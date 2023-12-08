import { parse } from "url";
import { generateHtmlTemplate } from "./template";
import { getIframeWidth, isValidUrl } from "./utils";
import type { ViteDevServer } from "vite";

export function realtimeDiff(url2: string) {
  return {
    name: "vite-plugin-realtime-diff",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) {
          next();
          return;
        }

        const { query } = parse(req.url, true);
        let url1 = `http://${req.headers.host}${req.url}`;
        const pathname = req.url as string;
        url2 = new URL(url2).origin + pathname;

        if (query._diff && query._diff === "true") {
          // Remove the _diff query param from the URL
          url1 = url1.replace("?_diff=true", "");
          url2 = url2.replace("?_diff=true", "");

          const widthKey = (query.width as string) || "100%";
          const iframeWidth = getIframeWidth(widthKey);

          if (!isValidUrl(url1) || !isValidUrl(url2)) {
            res.statusCode = 400;
            res.end("Please provide valid URLs in the plugin options.");
            return;
          }

          res.setHeader("Content-Type", "text/html");
          res.end(generateHtmlTemplate(url1, url2, iframeWidth, widthKey));
        } else {
          next();
        }
      });
    },
  };
}
