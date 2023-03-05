// import Links from './links.json'
const {SSDiff} = require('ssdiff')
const localhost = 'http://site-qwik.vercel.app'
const production = 'https://www.builder.io'

// Function to filter links from an external source
const getLinks = (links) => {
    links.forEach((link) => {
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
    const pathnames = ['/c/docs/quickstart', '/c/docs/models-intro']

    const ssDiff = new SSDiff({
       url1: localhost,
       url2: production,
       pathnames,
       debug : true,
    })

    const result = await ssDiff.result()
    // console.log(result)
}

helper()  