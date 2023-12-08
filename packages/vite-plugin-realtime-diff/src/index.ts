import { parse } from "url";
import { generateHtmlTemplate } from "./template";
import { getIframeWidth, isValidUrl } from "./utils";
import type { ViteDevServer } from "vite";

export function realtimeDiff(url1: string, url2: string) {
  return {
    name: "vite-plugin-realtime-diff",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) {
          next();
          return;
        }

        const { pathname, query } = parse(req.url, true);

        if (pathname === "/_diff") {
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
