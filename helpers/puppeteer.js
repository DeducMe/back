import puppeteer from "puppeteer";

export const LAUNCH_PUPPETEER_OPTS = {
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--window-size=1920x1080",
  ],
  headless: true,
};

export const PAGE_PUPPETEER_OPTS = {
  networkIdle2Timeout: 5000,
  waitUntil: "networkidle2",
  timeout: 10000,
};

const browsers = [];

export async function launchPuppeteer() {
  try {
    browsers.push(await puppeteer.launch(LAUNCH_PUPPETEER_OPTS));
  } catch (err) {
    throw err;
  }
}

export async function closeBrowser(index) {
  try {
    browsers[index].close();
  } catch (err) {
    throw err;
  }
}

export async function closeAllBrowsers() {
  try {
    for (const browser of browsers) {
      browser.close();
    }
  } catch (err) {
    throw err;
  }
}

export async function createNewPage(url, index) {
  try {
    const page = await browsers[index].newPage();
    await page.goto(url, PAGE_PUPPETEER_OPTS);
    return page;
  } catch (err) {
    throw err;
  }
}

export async function getContent(page) {
  try {
    const content = await page.content();
    return content;
  } catch (err) {
    throw err;
  }
}
