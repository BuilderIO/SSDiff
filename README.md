## Example usage

```
import Links from '../links.json';

const localhost = 'http://site-qwik.vercel.app'
const production = 'https://www.builder.io'

// Function to filter links from an external source
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


```