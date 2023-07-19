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
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();
  console.log(res.req.query.url)
    await page.goto(res.req.query.url);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    // await page.type(".search-box__input", "automate beyond recorder");

    // // Wait and click on first result
    // const searchResultSelector = ".search-box__link";
    // await page.waitForSelector(searchResultSelector);
    // await page.click(searchResultSelector);

    // // Locate the full title with a unique string
    // const textSelector = await page.waitForSelector(
    //   "text/Customize and automate"
    // );
    // const fullTitle = await textSelector.evaluate((el) => el.textContent);
    const fullTitle = await page.title()
    const image = await page.screenshot()
    // Print the full title
    const logStatement = `The title of this blog post is ${fullTitle}`;
    console.log(logStatement)
    res.setHeader('content-type', 'image/png');
    
    res.send(image);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
