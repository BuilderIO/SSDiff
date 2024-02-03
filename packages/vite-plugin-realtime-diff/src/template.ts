import { defaultWidths } from "./constants";

/**
 * Generates the HTML template for the diff view.
 * @param {string} url1 - The first URL to compare.
 * @param {string} url2 - The second URL to compare.
 * @param {string} iframeWidth - The width of the iframe.
 * @param {string} widthKey - The key for the selected width.
 * @return {string} The generated HTML string.
 */
export function generateHtmlTemplate(url1: string, url2: string, iframeWidth: string, widthKey: string) {
  return `
    <html>
            <head>
              <style>
              body {
                    margin: 0;
                    background: black;
              }
                .iframe-container {
                  position: relative;
                  width: 100%;
                  height: 15000px;
                  overflow-y: scroll;
                }
                iframe {
                  position: absolute;
                  top: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  width: ${iframeWidth};
                  height: 100%;
                  border: none;
                  pointer-events: none;
                  overflow: hidden;
                }
                .overlay {
                  mix-blend-mode: difference;
                }
                .width-form {
                  position: fixed;
                  top: 10px;
                  left: 10px;
                  z-index: 9999;
                }
              </style>
            </head>
            <body>
            <form action="/_diff" class="width-form">
                  <select name="width" onchange="this.form.submit()">
                    ${Object.keys(defaultWidths)
                      .map((key) => `<option value="${key}" ${widthKey === key ? "selected" : ""}>${key}</option>`)
                      .join("")}
                  </select>
                </form>
                <div class="iframe-container">
                        <iframe id="frame1" src="${url1}"></iframe>
                        <iframe id="frame2" src="${url2}" class="overlay"></iframe>
                </div>
            </body>
          </html>
    `;
}
