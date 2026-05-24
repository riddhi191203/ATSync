const puppeteer = require("puppeteer");

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("Browser launched successfully!");

    await browser.close();
  } catch (err) {
    console.error("Error launching browser:", err);
  }
})();