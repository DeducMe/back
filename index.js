import cherio from "cherio";
import {
  getContent,
  launchPuppeteer,
  createNewPage,
  closeBrowser,
} from "./helpers/puppeteer.js";
import * as fs from "fs";
const CITY = "Москва";
const ORGANIZATION_THEME = "Бар, паб";
const SITE = "https://yandex.ru/maps/?ll=37.736061%2C55.737109&z=9.4";

async function updateOrganizationsJson(data) {
  await fs.writeFileSync("./data/dataTest.json", JSON.stringify(data, 0, 2));
}

async function getOrganizationsJson() {
  return JSON.parse(fs.readFileSync("./data/myjsonfile.json", "utf-8"));
}

async function getOrganizationImages(page) {
  await page.waitForSelector("._name_gallery");

  await page.click("._name_gallery");

  await page.waitForSelector(".photo-wrapper__photo");
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
  await page.waitForSelector("._name_overview");
  await page.click("._name_overview");

  await page.waitForTimeout(300);

  return images;
}

async function getOrganizationRating(page) {
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

async function getOrganizationFeatures(page) {
  await page.waitForSelector("._name_features", {
    timeout: 100,
  });
  try {
    await page.click("._name_features");
  } catch {}
  await page.waitForTimeout(100);
  try {
    await page.waitForSelector(".business-feature-a11y-group-view", {
      timeout: 2000,
    });
  } catch {
    try {
      await page.click("._name_features");

      await page.waitForSelector(".business-feature-a11y-group-view", {
        timeout: 2000,
      });
    } catch {
      return;
    }
  }

  const pageContent = await getContent(page);
  const $ = cherio.load(pageContent);
  const features = {};
  features.menuFeatures = [];
  features.elseFeatures = [];
  $(".business-features-view__valued").each((i, el) => {
    features.menuFeatures.push(
      $(".business-features-view__valued-content", el).text()
    );
  });
  $(".business-features-view__bool-text").each((i, el) => {
    features.elseFeatures.push($(el).text());
  });
  await page.waitForTimeout(100);
  return features;
}

async function getOrganizationLogo(page) {
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

async function getMenuFromOrganizations(json, browserIndex, updateJson) {
  const page = await createNewPage(SITE, browserIndex - 1);

  for (
    let dataIndex = browserIndex - 1;
    dataIndex < json.length;
    dataIndex = dataIndex + 5
  ) {
    const item = json[dataIndex];
    const meta = item.properties.CompanyMetaData;

    await findOrganization(
      page,
      ORGANIZATION_THEME + " " + meta.name + " " + meta.address
    );

    meta.rating = await getOrganizationRating(page);
    meta.logo = await getOrganizationLogo(page);

    try {
      meta.features = await getOrganizationFeatures(page);
      meta.organizationImages = await getOrganizationImages(page);
    } catch {}

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
      continue;
    }

    meta.menuPositions = [];
    try {
      await page.waitForSelector(
        ".business-full-items-grouped-view__category",
        { timeout: 6000 }
      );

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

        meta.menuPositions.push({
          category,
          dishes,
        });
      });
    } catch {
      console.log(dataIndex, "error");
    }

    await page.waitForSelector("._type_close");
    await page.click("._type_close");
    console.log(dataIndex);

    updateJson(item);
  }
}

async function findOrganization(page, name) {
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

async function changeCity(page, city) {
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

async function getOrganizations(name) {
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

(async function main() {
  const data = await getOrganizationsJson();

  function updateJson(item) {
    const oldItemIndex = data.findIndex(
      (el) =>
        el.properties.CompanyMetaData.id === item.properties.CompanyMetaData.id
    );
    if (oldItemIndex !== -1) {
      data[oldItemIndex] = item;
    } else data.push(item);
    updateOrganizationsJson(data);
  }

  for (let i = 1; i < 6; i++) {
    await launchPuppeteer();
    getMenuFromOrganizations(data, i, updateJson);
  }

  // const organizationResult = await getOrganizations(ORGANIZATION_THEME);

  // await updateOrganizationsJson(organizationResult);

  // closeBrowser();
})();
