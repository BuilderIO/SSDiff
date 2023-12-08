import { describe, expect, it } from "vitest";
import { getIframeWidth, isValidUrl } from "../src/utils";
import { defaultWidths } from "../src/constants";

describe("getIframeWidth", () => {
  it("should return the correct width for a valid key", () => {
    const key = "1080p";
    const expectedWidth = defaultWidths[key];
    expect(getIframeWidth(key)).toBe(expectedWidth);
  });

  it("should return the default width for an invalid key", () => {
    const invalidKey = "invalid-key";
    const defaultWidth = defaultWidths["100%"];
    expect(getIframeWidth(invalidKey)).toBe(defaultWidth);
  });
});

describe("isValidUrl", () => {
  it("should return true for a valid URL", () => {
    const validUrl = "https://www.example.com";
    expect(isValidUrl(validUrl)).toBe(true);
  });

  it("should return false for an invalid URL", () => {
    const invalidUrl = "invalid-url";
    expect(isValidUrl(invalidUrl)).toBe(false);
  });
});
