const { SSDiff } = require('ssdiff');
const localhost = 'http://site-qwik.vercel.app';
const production = 'https://www.builder.io';

// Function to filter links from an external source
const getLinks = (links, result) => {
  links.forEach((link) => {
    if (link.subLinks) {
      getLinks(link.subLinks, result);
    } else {
      // only take the links that are in the docs
      if (link.link.indexOf('/c/docs') !== -1) {
        try {
          const url = new URL(link.link);
          result.push(url.pathname);
        } catch (e) {
          result.push(link.link);
        }
      }
    }
  });
  return result;
};

const helper = async () => {
  const pathnames = ['/c/docs/developers'];
  const ssDiff = new SSDiff({
    url1: localhost,
    url2: production,
    pageConfig: {
      waitUntil: 'domcontentloaded',
      timeout: 0,
    },
    pathnames,
    screenshotConfig: {
      fullPage: true,
    },
    debug: true,
    outputFile: true,
  });

  const result = await ssDiff.result();
  console.log(result);
};

helper();
