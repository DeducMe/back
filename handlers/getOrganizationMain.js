import cherio from "cherio";
import { getContent } from "../helpers/puppeteer.js";

export async function getOrganizationRating(page) {
  try {
    await page.waitForSelector(".business-rating-badge-view__rating-text", {
      timeout: 3000,
    });
  } catch {
    return;
  }

  const pageContent = await getContent(page);
  const $ = cherio.load(pageContent);
  return $(".business-rating-badge-view__rating-text").eq(0).text();
}

export async function getOrganizationLogo(page) {
  try {
    await page.waitForSelector(".card-offer-media-view__logo", {
      timeout: 100,
    });
    const pageContent = await getContent(page);
    const $ = cherio.load(pageContent);
    return $(".card-offer-media-view__logo")
      .css()
      ["background-image"]?.split('url("')
      .join("")
      .slice(0, -2);
  } catch {
    try {
      await page.waitForSelector(".card-header-media-view__logo", {
        timeout: 100,
      });
      const pageContent = await getContent(page);
      const $ = cherio.load(pageContent);
      return $(".card-header-media-view__logo")
        .children("img")
        .eq(0)
        .attr("src");
    } catch {
      return null;
    }
  }
}
