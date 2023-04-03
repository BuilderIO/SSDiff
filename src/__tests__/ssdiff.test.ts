import { describe, expect, test } from '@jest/globals';
import { PNG } from 'pngjs';
import { SSDiff } from '../index';

describe('SSDiff method testing', () => {
  const config = {
    url1: 'http://site-qwik.vercel.app',
    url2: 'https://www.builder.io',
    pathnames: ['/c/docs/developers', '/c/docs/quickstart'],
  };
  const ssdiff = new SSDiff(config);
  let screenshot: any = null;

  test('default config values being set correctly', () => {
    expect(ssdiff.failInCaseOfDifferentSize).toBe(false);
    expect(ssdiff.debug).toBe(false);
    expect(ssdiff.outputFile).toBe(false);
    expect(ssdiff.browserConfig).toEqual({
      defaultViewport: {
        width: 1294,
        height: 1280,
      },
    });
    expect(ssdiff.screenshotConfig).toEqual({
      type: 'png',
    });
  });

  test('test diffScreenshots is set correctly', () => {
    const todaysDate = new Date().toISOString().split('T')[0];
    const cwd = process.cwd();
    expect(ssdiff.diffScreenshots).toBe(`${cwd}/screenshots/${todaysDate}/diff`);
  });

  test('test browser open and close', async () => {
    // initially should be null
    expect(ssdiff.browser).toBe(null);
    await ssdiff.puppeteer_browser_open();
    expect(ssdiff.browser).not.toBe(null);
    await ssdiff.puppeteer_browser_close();
    expect(ssdiff.browser).toBe(null);
  });

  test('test getFileName method', () => {
    expect(ssdiff.getFileName('http://site-qwik.vercel.app/c/docs/developers/')).toBe('developers');
    expect(ssdiff.getFileName('https://www.builder.io/c/docs/quickstart')).toBe('quickstart');
  });

  test('test screenshot method', async () => {
    await ssdiff.puppeteer_browser_open();
    screenshot = await ssdiff.screenshot(config.url1 + config.pathnames[0]);
    expect(screenshot).toBeInstanceOf(Buffer);
    expect(screenshot).not.toBe(null);
    await ssdiff.puppeteer_browser_close();
  });

  test('test resize method', async () => {
    await ssdiff.puppeteer_browser_open();
    if (!screenshot) {
      fail('screenshot is null');
      return;
    }
    const image = PNG.sync.read(screenshot);
    const resized = await ssdiff.resizeImage(image, image.width + 10, image.height + 10);
    expect(resized.height).toEqual(image.height + 10);
    expect(resized.width).toEqual(image.width + 10);
    await ssdiff.puppeteer_browser_close();
  });
});

function fail(arg0: string) {
  throw new Error(arg0);
}
