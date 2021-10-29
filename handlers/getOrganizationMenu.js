import cherio from "cherio";
import { getContent } from "../helpers/puppeteer.js";

export default async function getOrganizationMenu(page) {
  try {
    await page.click(".search-snippet-view__link-overlay");
  } catch {}
  try {
    await page.waitForSelector(".card-title-view__title-link");
  } catch {}
  try {
    await page.click("._name_menu");
  } catch (e) {
    await page.waitForTimeout(100);

    await page.waitForSelector("._type_close");
    await page.click("._type_close");
    return null;
  }

  const menuPositions = [];
  try {
    await page.waitForSelector(".business-full-items-grouped-view__category", {
      timeout: 6000,
    });

    const menuItemsNum = await page.evaluate((selector) => {
      return document.getElementsByClassName(selector)?.length;
    }, "business-full-items-grouped-view__item");
    await page.waitForTimeout(10);

    for (let i = 0; i < menuItemsNum; i++) {
      await page.evaluate(
        (selector, i) => {
          const element = document.getElementsByClassName(selector)[i];
          if (element) element.scrollIntoView();
        },
        "business-full-items-grouped-view__item",
        i
      );
      await page.waitForTimeout(50);
    }

    const pageContent = await getContent(page);
    const $ = cherio.load(pageContent);

    $(".business-full-items-grouped-view__category").each((i, el) => {
      let category;
      $(".business-full-items-grouped-view__title", el).each((i, el) => {
        category = $(el).text();
      });

      const dishes = [];

      $(".business-full-items-grouped-view__item").each((i, el) => {
        const dish = {};

        $(".related-item-photo-view__title", el).each((i, el) => {
          dish.title = $(el).text();
        });

        $(".related-item-photo-view__image", el).each((i, el) => {
          $(".background-image__bg", el).each((i, el) => {
            dish.image = $(el)
              .css()
              ["background-image"]?.split('url("')
              .join("")
              .slice(0, -2);
          });
        });

        $(".related-item-photo-view__description", el).each((i, el) => {
          dish.description = $(el).text();
        });
        $(".related-product-view__price", el).each((i, el) => {
          dish.price = $(el).text();
        });
        if (Object.keys(dish).length > 0) dishes.push(dish);
      });

      menuPositions.push({
        category,
        dishes,
      });
    });
  } catch (e) {
    console.log("Error on getting menu\n", e);
  }

  await page.waitForSelector("._type_close");
  await page.click("._type_close");

  return menuPositions;
}
