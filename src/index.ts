import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import log4js from 'log4js';
import fs from 'fs';
import { PNG } from 'pngjs';
import { URL } from 'url';

log4js.configure({
    appenders: { 
        debug: { type: 'file', filename: 'ssdiff-debug.log' } ,
        out: { type: 'file', filename: 'ssdiff-output.log' } 
    },
    categories: { 
        default: { appenders: ['debug'], level: 'debug' }, 
        output: { appenders: ['out'], level: 'info' } 
    },
})

const debugLogger = log4js.getLogger();
const infoLogger = log4js.getLogger('output');

export interface BrowserConfig {
  defaultViewport: { width: number; height: number };
}
export interface ScreenshotConfig {
  type: 'png' | 'jpeg' | 'webp';
  fullPage?: boolean;
}
export interface SSDiffConfig {
  url1: string; // url of domain1
  url2: string; // url of domain2
  pathnames: string[]; // array of pathnames to be compared
  browserConfig?: BrowserConfig; // config passed to puppeteer.launch
  screenshotConfig?: ScreenshotConfig; // config passed to page.screenshot
  debug?: boolean; // if true, debug logs will be printed
  outputFile?: boolean // if true, output logs will be printed
}

export class SSDiff {
  url1: any;
  url2: any;
  pathnames: any;
  browser: any;
  debug: boolean;
  outputFile: boolean;
  browserConfig: BrowserConfig;
  screenshotConfig: ScreenshotConfig;
  screenshotsFolder: string; // screenshots folder in the root of the project
  todaysScreenshotFolder: string; // screenshots folder for the current date
  diffScreenshots: string; // diff screenshots folder for the current date (this still remians, because we might store ss of domains separately)
  fileNameDifferenceMap: Map<string, number> = new Map(); // result of the comparison

  constructor(config: SSDiffConfig) {
    const defaultScreenshotConfig: ScreenshotConfig = {
      type: 'png',
    };
    const defaultBrowserConfig: BrowserConfig = {
      defaultViewport: {
        width: 1294,
        height: 1280,
      },
    };
    this.url1 = config.url1;
    this.url2 = config.url2;
    this.pathnames = config.pathnames;
    this.debug = config.debug ?? false;
    this.outputFile = config.outputFile ?? false;
    this.browserConfig = config.browserConfig ?? defaultBrowserConfig;
    this.screenshotConfig = config.screenshotConfig ?? defaultScreenshotConfig;
    this.browser = null;
    this.screenshotsFolder = process.cwd() + '/screenshots';
    const todaysDate = new Date().toISOString().split('T')[0];
    this.todaysScreenshotFolder = this.screenshotsFolder + '/' + todaysDate;
    this.diffScreenshots = this.todaysScreenshotFolder + '/diff';
    if (!fs.existsSync(this.diffScreenshots)) {
      fs.mkdirSync(this.diffScreenshots, { recursive: true });
      this.log('Created diff folder for todays ss');
    }
  }
  log(text: string) {
    if (this.debug) {
      debugLogger.debug(text)
    }
  }
  async puppeteer_browser_open() {
    if (!this.browser) {
      this.browser = await puppeteer.launch(this.browserConfig);
    }
  }
  async puppeteer_browser_close() {
    if (this.browser) {
      await this.browser.close();
      // setting this as null so we dont get closed instance the next time
      this.browser = null;
    }
  }
  getFileName(url: string) {
    const parsedURL = new URL(url);
    return parsedURL.pathname.split('/')[3];
  }
  async screenshot(url: any) {
    const page = await this.browser.newPage();
    this.log('New Page in browser opened');
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 0,
    });
    this.log(`URL opened on page ${url}`);
    // fileLocation ->  localhost_developers
    const screenshot = await page.screenshot(this.screenshotConfig);
    await page.close();
    this.log('Page closed');
    return screenshot;
  }
  /**
   * Returns the pixel difference number for two images and creates a difference image
   *
   * @remarks
   * This is the main method for comparision of screenshots for a pathname on two domains.
   *
   * @param url1 - url of domain1 + pathnmae
   * @param url2 - url of domain2 + pathname
   * @param fileName - filename determined by getFileName method
   * @returns Pixel difference number for two images and creates a difference image
   */
  async compare(compareObj: { url1: any; url2: any; fileName: any }) {
    const { url1, url2, fileName } = compareObj;
    const screenshots = await Promise.all([this.screenshot(url1), this.screenshot(url2)]);
    // TODO: Make the file name dynamic based on the fileType in screenshotConfig
    const image1 = PNG.sync.read(screenshots[0]);
    const image2 = PNG.sync.read(screenshots[1]);
    const { height, width } = image1;
    const diff = new PNG({ width, height });

    // Sort the files based on the most different, based on the number of pixels and total pixels
    const numDiffPixels = pixelmatch(image1.data, image2.data, diff.data, width, height, {
      threshold: 0.7,
      includeAA: true,
    });
    const totalPixels = image1.data.length / 4; // suggested by co-pilot and works
    const differencePercentage = (numDiffPixels / totalPixels) * 100;
    this.log(
      `file name: ${fileName} | numDiffPixels: ${numDiffPixels} | height: ${height} | width: ${width} | totalPixels: ${totalPixels} | percentage: ${
        (numDiffPixels / totalPixels) * 100
      }}`,
    );
    this.fileNameDifferenceMap.set(fileName, differencePercentage); // this map is used to sort the files in the folde
    fs.writeFileSync(this.diffScreenshots + `/${fileName}`, PNG.sync.write(diff));
  }
  async sortFilesBasedOnDifference() {
    const sortedMap = new Map([...this.fileNameDifferenceMap.entries()].sort((a, b) => b[1] - a[1]));
    return sortedMap;
  }
  /**
   * Returns the sorted result map with fileName and pixel difference percentage
   *
   * @remarks
   * This is the main method called to use the tool
   *
   * @returns Map<fileName, percentageDifference>
   */
  async result() {
    await this.puppeteer_browser_open();
    this.log('Browser opened');
    const urls = this.pathnames.map((pathname: any) => {
      return {
        url1: this.url1 + pathname,
        url2: this.url2 + pathname,
        fileName: this.getFileName(this.url1 + pathname),
      };
    });
    const promises = urls.map((compareObj: any) => this.compare(compareObj));
    await Promise.all(promises);
    await this.puppeteer_browser_close();
    const resultMap = await this.sortFilesBasedOnDifference();
    this.log('Browser closed');
    // Output resultMap in output file only if configured
    if(this.outputFile)
      infoLogger.info(resultMap)
    return resultMap;
  }
}
