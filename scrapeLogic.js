const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {

  const browser = await puppeteer.launch({

    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    headless: 'new',  
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    
    const page = await browser.newPage();

    await page.goto("https://pptr.dev/guides/docker",{waitUntil: "domcontentloaded"});

    const fullTitle = await page.title()
    // Print the full title
    const logStatement = `The title of this blog post is ${fullTitle}`;
    
    res.send(logStatement);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
