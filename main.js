import {
  launchPuppeteer,
  createNewPage,
  closeBrowser,
} from "./helpers/puppeteer.js";

import { postOrganization, postHours } from "./apiQueries/index.js";

import getOrganizationFeatures from "./handlers/getOrganizationFeatures.js";
import getOrganizationReviews from "./handlers/getOrganizationReviews.js";
import getOrganizationImages from "./handlers/getOrganizationImages.js";
import getOrganizationMenu from "./handlers/getOrganizationMenu.js";
import {
  getOrganizationLogo,
  getOrganizationRating,
  getOrganizationSpecialOffers,
} from "./handlers/getOrganizationMain.js";
import { getNewDataFromApi } from "./handlers/workWithJson.js";
import { findOrganization } from "./handlers/getOther.js";

const CITY = "Москва";
const ORGANIZATION_THEME = "Бар, паб";
const BROWSER_PAGES = 2;

const SITE = "https://yandex.ru/maps/?ll=37.736061%2C55.737109&z=9.4";

async function getOrganizationData(json, browserIndex, updateJson) {
  for (
    let dataIndex = browserIndex - 1;
    dataIndex < json.length;
    dataIndex = dataIndex + BROWSER_PAGES
  ) {
    await launchPuppeteer(browserIndex - 1);
    const page = await createNewPage(SITE, browserIndex - 1);

    const item = json[dataIndex];
    const meta = item.properties.CompanyMetaData;

    await findOrganization(
      page,
      ORGANIZATION_THEME + " " + meta.name + " " + meta.address
    );

    meta.rating = await getOrganizationRating(page);
    meta.logo = await getOrganizationLogo(page);
    meta.specialOffers = await getOrganizationSpecialOffers(page);

    try {
      meta.menuPositions = await getOrganizationMenu(page);
      meta.organizationImages = await getOrganizationImages(page);
      meta.features = await getOrganizationFeatures(page);
      meta.reviews = await getOrganizationReviews(page);

      await page.waitForSelector("._type_close", { timeout: 3000 });
      await page.click("._type_close");
    } catch (e) {
      console.log("module error", e);
    }

    console.log(dataIndex, meta.name);
    updateJson(item);
    closeBrowser(browserIndex - 1);
  }
}

async function main() {
  const startData = await getNewDataFromApi();
  console.log(startData);
  async function updateJson(item) {
    const itemCoords = item.geometry.coordinates;
    const itemProps = item.properties;
    const itemMeta = itemProps.CompanyMetaData;
    const normailizedItem = {
      coordinateX: itemCoords[0],
      coordinateY: itemCoords[1],
      name: itemProps.name || null,
      address: itemProps.description || null,
      id: itemMeta.id || null, // скорее всего сделаю кастомный id, а то яндекс слишком большой присылает. в int не лезет
      url: itemMeta.url || null,
      phones: itemMeta.Phones?.map((item) => item.formatted) || null,
      categories: itemMeta.Categories?.map((item) => item.name) || null,
      rating: parseFloat(itemMeta.rating?.replace(",", ".")) || null,
      logo: itemMeta.logo || null,
      menuFeatures: itemMeta.features?.menuFeatures || null,
      elseFeatures: itemMeta.features?.elseFeatures || null,
      organizationImages: itemMeta.organizationImages || null,
      // дальше кал говна, надо отдельную таблицу делать, а не вот это. С массивами выше то же самое
      menuPositions:
        itemMeta.menuPositions?.map((menuItem) => {
          return (
            menuItem.category +
            ":[" +
            menuItem.dishes
              .map(
                (item) =>
                  `${!!item.title && item.title + "=+="}${
                    !!item.image && item.image + "=+="
                  }${!!item.description && item.description + "=+="}${
                    item.price
                  }`
              )
              .join("|") +
            "]"
          );
        }) || null,
      userReviews:
        itemMeta.reviews?.userReviews?.map(
          (item) => item.text + "=+=" + item.author + "=+=" + item.stars
        ) || null,
      reviewsCategories:
        itemMeta.reviews?.reviewsCategories?.map(
          (item) =>
            item.title +
            "=+=" +
            item.reviewsAmount +
            "=+=" +
            item.reviewsLinePositive +
            "=+=" +
            item.reviewsLineNegative
        ) || null,
    };

    //переписать кринж ниже
    const normailizedHours = {
      id: itemMeta.id,
      text: itemMeta.Hours.text,
      Everyday: "",
      Monday: "",
      Tuesday: "",
      Wednesday: "",
      Thursday: "",
      Friday: "",
      Saturday: "",
      Sunday: "",
    };

    itemMeta.Hours.Availabilities.forEach((item) => {
      normailizedHours.Everyday = item.Everyday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Everyday;
      normailizedHours.Monday = item.Monday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Monday;
      normailizedHours.Tuesday = item.Tuesday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Tuesday;
      normailizedHours.Wednesday = item.Wednesday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Wednesday;
      normailizedHours.Thursday = item.Thursday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Thursday;
      normailizedHours.Friday = item.Friday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Friday;
      normailizedHours.Saturday = item.Saturday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Saturday;
      normailizedHours.Sunday = item.Sunday
        ? `${item.Intervals[0].from.slice(
            0,
            -3
          )} - ${item.Intervals[0].to.slice(0, -3)}`
        : normailizedHours.Sunday;
    });

    postOrganization(normailizedItem).then((data) => {
      console.log("posted", itemMeta.id);
      // getOrganizationInfo().then((data) => updateOrganizationsJson(data));
    });

    postHours(normailizedHours).then((data) => {
      console.log("addedHours", itemMeta.id);
      // getOrganizationInfo().then((data) => updateOrganizationsJson(data));
    });
  }

  const tasksRunning = [];

  for (let i = 1; i < BROWSER_PAGES + 1; i++) {
    const sendData = [].concat(startData).reverse();
    const a = new Promise((resolve, reject) => {
      resolve(getOrganizationData(sendData, i, updateJson));
    });
    tasksRunning.push(a);
  }
  await Promise.all(tasksRunning).then(main);
}

main();
