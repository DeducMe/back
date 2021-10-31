import cherio from "cherio";
import { getContent } from "../helpers/puppeteer.js";

export default async function getOrganizationImages(page) {
  try {
    await page.waitForSelector("._name_gallery", {
      timeout: 3000,
    });

    await page.click("._name_gallery");
    try {
      await page.waitForSelector(".photo-wrapper__photo", {
        timeout: 2000,
      });
    } catch {
      try {
        await page.click("._name_gallery");

        await page.waitForSelector(".photo-wrapper__photo", {
          timeout: 2000,
        });
      } catch {
        return null;
      }
    }
  } catch {
    return null;
  }
  const photoItemsNum = await page.evaluate((selector) => {
    return document.getElementsByClassName(selector)?.length;
  }, "photo-list__frame-wrapper");
  await page.waitForTimeout(10);

  for (let i = 0; i < photoItemsNum; i++) {
    await page.evaluate(
      (selector, i) => {
        const element = document.getElementsByClassName(selector)[i];
        if (element) element.scrollIntoView();
      },
      "photo-list__frame-wrapper",
      i
    );
    await page.waitForTimeout(50);
  }

  const pageContent = await getContent(page);
  const $ = cherio.load(pageContent);
  const images = [];

  $(".photo-wrapper__photo").each((i, el) => {
    images.push($(el).attr("src"));
  });

  await page.waitForTimeout(300);

  return images;
}
