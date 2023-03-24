import {describe, expect, test, beforeAll} from '@jest/globals';
import { SSDiff } from '../index';

describe('SSDiff method testing', () => {
  let ssdiff = new SSDiff({
    url1 : 'http://site-qwik.vercel.app',
    url2 : 'https://www.builder.io',
    pathnames : ['/c/docs/developers', '/c/docs/quickstart']
  })
  
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
});