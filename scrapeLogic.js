const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const url = res.req.query.url
  if (!res.req.query.url) {
    res.json({message: "endereco mal formatado: ?url=endereco"}).status(400).send()
    return 
  }

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
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {

      if(request.url().startsWith(url)) {
        request.continue()
      } else {
        request.abort() 
      }
    }); 

    await page.goto(url);

    const newsValor = await page.evaluate( div =>{
      
      const nodeList = document.getElementsByClassName('headline')
      const estadaoNews = [...nodeList]
      const list = estadaoNews.map(({textContent}) => ({jornal: 'Estadao', noticia: textContent}))
      return list  
    })

   
    res.send(newsValor);
  } catch (e) {

    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
