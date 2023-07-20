const puppeteer = require("puppeteer");
require("dotenv").config();

const noticiasNumero = (news ,number= 8) => {
  return  news.slice(0,number)
}



const scrapeLogic = async (res) => {
  //const url = res.req.query.url
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
   
    let url = urls[i]
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {

      if(request.url().startsWith(url)) {
        request.continue()
      } else {
        request.abort() 
      }
    }); 
    await page.goto(urls, { waitUntil: 'networkidle2' });
    if(url.includes('estadao')) { 
      const noticiaJornal = await page.evaluate( () =>{
      const nodeList = document.getElementsByClassName('headline')
      const estadaoNews = [...nodeList]
      const list = estadaoNews.map(({textContent}) => ({jornal: 'Estadao', noticia: textContent}))
      return list  
    })
      noticias = noticias.concat(noticiasNumero(noticiaJornal,4))

    }
    if(url.includes('folha'))   {
      const noticiaJornal = await page.evaluate(() => {
          const nodeList = document.getElementsByClassName("c-headline__title")
          const folhaNews = [...nodeList]
          const list = folhaNews.map(({
            textContent
          }) => ({jornal: "Folha de SP", noticia: textContent}))
          return list
        })
       noticias = noticias.concat(noticiasNumero(noticiaJornal,4))
    }
    if(url.includes('valor'))   {
      const noticiaJornal = await page.evaluate(()=>{
        const nodeList = document.getElementsByClassName('feed-post-link gui-color-primary')
        const valorNews = [...nodeList]
        const list =  valorNews.map(({textContent}) => ({jornal: 'Valor', noticia: textContent}))
      return list 
    })
       noticias = noticias.concat(noticiasNumero(noticiaJornal,4))
    }
      }

  res.set('Access-Control-Allow-Origin', '*');

  if (res.req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    res.send(noticias);
  }


  } catch (e) {

    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
