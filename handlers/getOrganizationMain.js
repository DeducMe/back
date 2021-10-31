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

export async function getOrganizationSpecialOffers(page) {
  try {
    await page.waitForSelector(".card-special-offers-view", {
      timeout: 1000,
    });
    const pageContent = await getContent(page);
    const $ = cherio.load(pageContent);
    const carouselImages = [];
    $(".card-special-offers-view").each((i, el) => {
      $(".card-special-offers-view__item-img", el).each((i, el) => {
        carouselImages.push($(el).attr("src"));
      });
    });
    return carouselImages;
  } catch {}
}
