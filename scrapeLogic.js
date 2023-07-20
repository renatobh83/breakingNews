const puppeteer = require("puppeteer");
require("dotenv").config();

const withPage = (browser) => async (fn) => {  
  const page = await browser.newPage();  
  try {
    return await fn(page);
  } finally {
  //  await page.close();
  }
}


const scrapeLogic = async (res) => {
  const url = res.req.query.url
  // if (!res.req.query.url) {
  //   res.json({message: "endereco mal formatado: ?url=endereco"}).status(400).send()
  //   return 
  // }
   let noticias= []
 const urls = ['https://valor.globo.com/ultimas-noticias/',
              'https://www1.folha.uol.com.br/ultimas-noticias/',
              'https://www.estadao.com.br/ultimas/'];
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      ],
    executablePath:
    process.env.NODE_ENV === "production"
    ? process.env.PUPPETEER_EXECUTABLE_PATH
    : puppeteer.executablePath(),
  });
  try {

    for (let i = 0; i< urls.length; i ++) 
      {
   

    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {

      if(request.url().startsWith(urls[i])) {
        request.continue()
      } else {
        request.abort() 
      }
    }); 
    await page.goto(urls[i], { waitUntil: 'networkidle2' });
    if(urls[i].includes('estadao')) { 
      const noticiaJornal = await page.evaluate( () =>{
      const nodeList = document.getElementsByClassName('headline')
      const estadaoNews = [...nodeList]
      const list = estadaoNews.map(({textContent}) => ({jornal: 'Estadao', noticia: textContent}))
      return list  
    })
      noticias = noticias.concat(noticiaJornal)

    }
    if(urls[i].includes('folha'))   {
      const noticiaJornal = await page.evaluate(() => {
          const nodeList = document.getElementsByClassName("c-headline__title")
          const folhaNews = [...nodeList]
          const list = folhaNews.map(({
            textContent
          }) => ({jornal: "Folha de SP", noticia: textContent}))
          return list
        })
       noticias = noticias.concat(noticiaJornal)
    }
    if(urls[i].includes('valor'))   {
      const noticiaJornal = await page.evaluate(()=>{
        const nodeList = document.getElementsByClassName('feed-post-link gui-color-primary')
        const valorNews = [...nodeList]
        const list =  valorNews.map(({textContent}) => ({jornal: 'Valor', noticia: textContent}))
      return list 
    })
       noticias = noticias.concat(noticiaJornal)
    }
      }
    res.send(noticias);
  } catch (e) {

    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
