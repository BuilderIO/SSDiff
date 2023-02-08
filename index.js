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
const path = require("path");
class ScreenshotDiff{
    constructor(url_1, url_2, debug = false){
        this.url_1 = url_1
        this.url_2 = url_2
        this.browser = null
        this.debug = debug
        this.browserConfig = {
            defaultViewport: {
              width: 1294,
              height: 1280,
            },
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
       await page.goto(url, {
        waitUntil:"networkidle0"
       })
       this.log('URL opened on page')
       // fileLocation ->  localhost_developers
       const filePath = __dirname + '/screenshots/' 
       const domain = (parsedURL.hostname.indexOf('localhost') !== -1 ? 'localhost' : 'production') + '/'
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
        await this.puppeteer_browser_close()
        this.log('Browser closed')
        const fileName = this.getFileName(this.url_1)
        const result = pixelmatch(image_1.data, image_2.data, diff.data, width, height, { threshold: 0.7, includeAA: true });
        fs.writeFileSync(__dirname + `/screenshots/diff/${fileName}`, PNG.sync.write(diff));
    }
}


const url_1 = "http://localhost:5173/c/docs/how-builder-works"
const url_2 = "https://www.builder.io/c/docs/how-builder-works"
const SD = new ScreenshotDiff(url_1, url_2, true)
SD.result()