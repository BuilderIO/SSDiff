import { defaultWidths } from "./constants";

/**
 * Gets the width of the iframe.
 * @param {string} widthKey - The key for the selected width.
 * @param {Object} defaultWidths - The default widths object.
 * @return {string} The width of the iframe.
 */
export function getIframeWidth(widthKey: string) {
  return defaultWidths[widthKey] || defaultWidths["100%"];
}

/**
 * Checks if the URL is valid.
 * @param {string} url - The URL to check.
 * @return {boolean} Whether the URL is valid.
 */
export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
