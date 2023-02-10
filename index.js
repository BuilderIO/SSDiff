// go to the webiste1 take ss
// go to website2 take ss
// match the ss with pixel match and sho the difference 
// ISSUES : 
// page size needs to be same
// Position of pixels
const puppeteer = require("puppeteer");
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const PNG = require('pngjs').PNG
const Links = require('./links.json');
const { URL } = require("url");
const { isArray } = require("util");

class ScreenshotDiff{
    constructor(url_1, url_2, browserConfig, debug = false, browser=null, close_browser_after_result = false){
        this.url_1 = url_1
        this.url_2 = url_2
        this.browser = browser
        this.debug = debug
        this.close_browser_after_result = close_browser_after_result
        this.browserConfig = browserConfig
        const localhostScreenshots = __dirname + '/screenshots/localhost';
        const productionScreenshots = __dirname + '/screenshots/production';
        const diffScreenshots = __dirname + '/screenshots/diff';
        if (!fs.existsSync(localhostScreenshots)){
            fs.mkdirSync(localhostScreenshots, { recursive: true });
            this.log("Created folder for localhost ss")
        }
        if (!fs.existsSync(productionScreenshots)){
            fs.mkdirSync(productionScreenshots, { recursive: true });
            this.log("Created folder for production ss")
        }
        if (!fs.existsSync(diffScreenshots)){
            fs.mkdirSync(diffScreenshots, { recursive: true });
            this.log("Created folder for diff ss")
        }
    }
    log(text){
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
    getFileName(url){
        const parsedURL = new URL(url)
        return parsedURL.pathname.split('/')[3]
    }
    async screenshot(url){
       const parsedURL = new URL(url)
       await this.puppeteer_browser_open()
       this.log('Browser opened')
       const page = await this.browser.newPage();
       this.log('New Page in browser opened')
       console.log(url)
       await page.goto(url, {
            waitUntil:"networkidle0",
            timeout : 0
       })
       this.log('URL opened on page')
       // fileLocation ->  localhost_developers
       const filePath = __dirname + '/screenshots/' 
       const domain = (parsedURL.hostname.indexOf('localhost') !== -1 || parsedURL.hostname.indexOf('site-qwik') !== -1 ? 'localhost' : 'production') + '/'
       const fileName = this.getFileName(url)
       const fileLocation = filePath + domain + fileName
       await page.screenshot({path : fileLocation,type:"png"})
       this.log(`SS of the page saved at ${fileLocation}`)
       await page.close()
       this.log('Page closed')
       return fileLocation
    }
    
    async result(){
        const image_1 = PNG.sync.read(fs.readFileSync(await this.screenshot(this.url_1)));
        const image_2 = PNG.sync.read(fs.readFileSync(await this.screenshot(this.url_2)));
        console.log(image_1.height, image_2.height)
        const {height, width} = image_1
        const diff = new PNG({ width, height });
        if(this.close_browser_after_result){
            await this.puppeteer_browser_close()
            this.log('Browser closed')
        }
        const fileName = this.getFileName(this.url_1)
        pixelmatch(image_1.data, image_2.data, diff.data, width, height, { threshold: 0.7, includeAA: true });
        fs.writeFileSync(__dirname + `/screenshots/diff/${fileName}`, PNG.sync.write(diff));
    }
}

// const localhost = 'http://site-qwik.vercel.app'
const localhost = 'http://localhost:5173'
const production = 'https://www.builder.io'

const getLinks = (links, result) => {
    links.forEach((link) => {
        if(link.subLinks){
            getLinks(link.subLinks, result)
        }else{
            try{
                const url = new URL(link.link)
                result.push(url.pathname)
            }catch(e){
                result.push(link.link)
            }
        }
    })
    return result
}

const helper = async () => {
    const pathnames = getLinks(Links, []).slice(0, 10)
    console.log(pathnames)
    const browserConfig = {
        defaultViewport: {
          width: 1294,
          height: 1280,
        },
    }
    const browser = await puppeteer.launch(browserConfig)
    pathnames.forEach((pathname) => {
        new ScreenshotDiff(localhost+pathname, production+pathname, browserConfig, true, browser, false).result()
    })
}

helper()  