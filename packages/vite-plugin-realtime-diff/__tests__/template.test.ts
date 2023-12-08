import { describe, expect, it } from "vitest";
import { generateHtmlTemplate } from "../src/template";

describe("generateHtmlTemplate", () => {
  it("should generate the correct HTML template", () => {
    const url1 = "https://example1.com";
    const url2 = "https://example2.com";
    const iframeWidth = "100%";
    const widthKey = "100%";

    const template = generateHtmlTemplate(url1, url2, iframeWidth, widthKey);

    expect(template).toContain(`src="${url1}"`);
    expect(template).toContain(`src="${url2}"`);

    expect(template).toContain(`width: ${iframeWidth};`);

    expect(template).toContain(`<option value="${widthKey}" selected>${widthKey}</option>`);
  });
});
