import puppeteer from "puppeteer";
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import { PNG } from 'pngjs';
// import Links from '../links.json';
import { URL } from "url";

interface BrowserConfig {
    defaultViewport: { width: number; height: number; };
}
interface ScreenshotConfig {
    type: 'png' | 'jpeg' | 'webp';
    fullPage?: boolean;
}
interface ScreenshotDiffConfig {
    url_1: string;
    url_2: string;
    pathnames: string[];
    browserConfig?: BrowserConfig
    screenshotConfig?: ScreenshotConfig
    debug?: boolean;
}

class ScreenshotDiff{
    url_1: any;
    url_2: any;
    pathnames: any;
    browser: any;
    debug: boolean;
    browserConfig: BrowserConfig;
    screenshotConfig: ScreenshotConfig;
    screenshotsFolder: string;
    todaysScreenshotFolder: string;
    diffScreenshots: string;
    fileNameDifferenceMap : Map<string, number> = new Map()

    constructor(config : ScreenshotDiffConfig){
        const defaultScreenshotConfig: ScreenshotConfig = {
            type : 'png'
        }
        const defaultBrowserConfig: BrowserConfig = {
            defaultViewport: {
                width: 1294,
                height: 1280,
            }
        }
        const defaultDebugOption = false
        this.url_1 = config.url_1
        this.url_2 = config.url_2
        this.pathnames = config.pathnames
        this.debug = config.debug ?? defaultDebugOption
        this.browserConfig = config.browserConfig ?? defaultBrowserConfig
        this.screenshotConfig = config.screenshotConfig ?? defaultScreenshotConfig
        this.browser = null
        // TODO: make the file naming dynamic based on hostnames
        this.screenshotsFolder = process.cwd() + '/screenshots'
        const todaysDate = new Date().toISOString().split('T')[0]
        this.todaysScreenshotFolder = this.screenshotsFolder + '/' + todaysDate
        this.diffScreenshots = this.todaysScreenshotFolder + '/diff';
        if(!fs.existsSync(this.diffScreenshots)){
            fs.mkdirSync(this.diffScreenshots, { recursive: true })
            this.log("Created diff folder for todays ss")
        }
    }
    log(text: string){
        if(this.debug){
            console.log(text)
        }
    }
    async puppeteer_browser_open(){
        if(!this.browser){
            this.browser = await puppeteer.launch(this.browserConfig)
        }
    }
    async puppeteer_browser_close(){
        if(this.browser){
            await this.browser.close()
            // setting this as null so we dont get closed instance the next time
            this.browser = null
        }
    }
    getFileName(url: string){
        const parsedURL = new URL(url)
        return parsedURL.pathname.split('/')[3]
    }
    async screenshot(url: any){
       const page = await this.browser.newPage();
       this.log('New Page in browser opened')
       await page.goto(url, {
            waitUntil:"networkidle0",
            timeout : 0
       })
       this.log(`URL opened on page ${url}`)
       // fileLocation ->  localhost_developers
       const screenshot = await page.screenshot(this.screenshotConfig)
       await page.close()
       this.log('Page closed')
       return screenshot
    }
    async compare(compareObj: { url_1: any; url_2: any; fileName: any; }){
        const {url_1, url_2, fileName} = compareObj
        const screenshots = await Promise.all([this.screenshot(url_1), this.screenshot(url_2)])
        // TODO: Make the file name dynamic based on the fileType in screenshotConfig
        const image_1 = PNG.sync.read(screenshots[0]);
        const image_2 = PNG.sync.read(screenshots[1]);
        const {height, width} = image_1
        const diff = new PNG({ width, height });

        // Sort the files based on the most different, based on the number of pixels and total pixels
        const numDiffPixels = pixelmatch(image_1.data, image_2.data, diff.data, width, height, { threshold: 0.7, includeAA: true });
        const totalPixels = image_1.data.length / 4
        const differencePercentage = (numDiffPixels/totalPixels) * 100
        this.log(`file name: ${fileName} | numDiffPixels: ${numDiffPixels} | height: ${height} | width: ${width} | totalPixels: ${totalPixels} | percentage: ${(numDiffPixels/totalPixels) * 100}}`)
        this.fileNameDifferenceMap.set(fileName, differencePercentage) // this map is used to sort the files in the folde
        fs.writeFileSync(this.diffScreenshots + `/${fileName}`, PNG.sync.write(diff));
    }
    async sortFilesBasedOnDifference(){
        const sortedMap = new Map([...this.fileNameDifferenceMap.entries()].sort((a, b) => b[1] - a[1]))
        return sortedMap
    }
    async result(){
        await this.puppeteer_browser_open()
        this.log('Browser opened')
        const urls = this.pathnames.map((pathname: any) => {
            return {
                url_1 : this.url_1 + pathname,
                url_2 : this.url_2 + pathname,
                fileName : this.getFileName(this.url_1+pathname) 
            }
        })
        const promises = urls.map((compareObj: any) => this.compare(compareObj))
        await Promise.all(promises)
        await this.puppeteer_browser_close()
        const resultMap = await this.sortFilesBasedOnDifference()
        this.log('Browser closed')
        return resultMap
    }
}

const localhost = 'http://site-qwik.vercel.app'
// const localhost = 'http://localhost:5173'
const production = 'https://www.builder.io'

const getLinks = (links: any[], result: string[]) => {
    links.forEach((link: { subLinks: any; link: string }) => {
        if(link.subLinks){
            getLinks(link.subLinks, result)
        }else{
            // only take the links that are in the docs
            if(link.link.indexOf('/c/docs') !== -1){
                try{
                    const url = new URL(link.link)
                    result.push(url.pathname)
                }catch(e){
                    result.push(link.link)
                }
            }   
        }
    })
    return result
}

const helper = async () => {
    // const pathnames = getLinks(Links, []).slice(140,165)
    const pathnames = ['/c/docs/quickstart', '/c/docs/models-intro', '/c/docs/enterprise-hub', '/c/docs/getting-started']
   
    const config = {
        url_1: localhost,
        url_2: production,
        pathnames,
    }
    const ssDiff = new ScreenshotDiff(config)
    const result = await ssDiff.result()
    console.log(result)
}

helper()  

