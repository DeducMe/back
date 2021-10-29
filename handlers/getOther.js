import cherio from "cherio";
import { getContent } from "../helpers/puppeteer.js";

export async function getOrganizations(name) {
  const page = await createNewPage(SITE);
  //await changeCity(page, CITY);
  await findOrganization(page, name);
  for (let i = 0; i < 300; i++) {
    await page.evaluate((selector) => {
      const elements = document.getElementsByClassName(selector);
      const element = elements[elements.length - 1];
      if (element) {
        element.scrollIntoView();
      }
    }, "search-business-snippet-view__title");
    await page.waitForTimeout(100);
  }

  const pageContent = await getContent(page);
  const $ = cherio.load(pageContent);
  const organizations = [];

  $(".search-business-snippet-view__content").each((i, el) => {
    const organization = {};

    $(".search-business-snippet-view__title", el).each((i, el) => {
      organization.name = $(el).text();
    });

    $(".search-business-snippet-view__category", el).each((i, el) => {
      organization.category = $(el).text();
    });

    $(".search-business-snippet-view__address", el).each((i, el) => {
      organization.address = $(el).text();
    });

    $(".business-rating-badge-view__rating-text", el).each((i, el) => {
      organization.rating = $(el).text();
    });
    organizations.push(organization);
  });
  await page.close();

  return organizations;
}

export async function changeCity(page, city) {
  await page.waitForSelector('input[type="search"]');
  await page.focus('input[type="search"]');
  await page.keyboard.type(city);
  await page.click('button[type="submit"]');
  await page.focus('button[type="button"]');
  await page.waitForTimeout(100);
  await page.waitForSelector(".card-title-view__title");

  await page.waitForSelector("._type_close");
  await page.click("._type_close");
  await page.waitForTimeout(1000);

  return;
}

export async function findOrganization(page, name) {
  await page.waitForSelector('input[type="search"]');
  await page.focus('input[type="search"]');
  await page.keyboard.type(name);
  await page.click('button[type="submit"]');
  try {
    await page.waitForSelector(".card-title-view__title-link", {
      timeout: 3000,
    });
  } catch (e) {
    try {
      await page.waitForSelector(".search-business-snippet-view__title");
    } catch {}
  }
  await page.focus('button[type="button"]');
}
