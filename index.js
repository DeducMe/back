import {
  launchPuppeteer,
  createNewPage,
  closeBrowser,
  closeAllBrowsers,
} from "./helpers/puppeteer.js";

import { postOrganization, postHours, postMenu } from "./apiQueries/index.js";

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

const ORGANIZATION_THEME = "Бар, паб";
const BROWSER_PAGES = 4;

const SITE = "https://yandex.ru/maps/?ll=37.736061%2C55.737109&z=9.4";

async function getOrganizationData(json, browserIndex, updateJson) {
  await launchPuppeteer(browserIndex - 1);
  let page = await createNewPage(SITE, browserIndex - 1);
  const restartBrowserIndexes = [];
  for (let k = browserIndex - 1; k < json.length; k = k + BROWSER_PAGES) {
    const formula = (k + 1) % (json.length / (BROWSER_PAGES * 40));
    if (formula === 0 || formula === 1 || formula === 2 || formula === 3)
      restartBrowserIndexes.push(k);
  }

  console.log(restartBrowserIndexes);

  for (
    let dataIndex = browserIndex - 1;
    dataIndex < json.length;
    dataIndex = dataIndex + BROWSER_PAGES
  ) {
    if (restartBrowserIndexes.includes(dataIndex)) {
      await closeBrowser(browserIndex - 1);
      await launchPuppeteer(browserIndex - 1);
      page = await createNewPage(SITE, browserIndex - 1);
    }
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
  }
  await closeBrowser(browserIndex - 1);
}

function updateOrganizationInfo(itemCoords, itemProps, itemMeta) {
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

  postOrganization(normailizedItem).then((data) => {
    console.log("posted", itemMeta.id);
    // getOrganizationInfo().then((data) => updateOrganizationsJson(data));
  });
}
function updateOrganizationHours(itemMeta) {
  /**
   * TODO переписать нормализацию
   */

  function normalizeHourString(interval) {
    return `${interval.from.slice(0, -3)} - ${interval.to.slice(0, -3)}`;
  }

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
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Everyday;
    normailizedHours.Monday = item.Monday
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Monday;
    normailizedHours.Tuesday = item.Tuesday
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Tuesday;
    normailizedHours.Wednesday = item.Wednesday
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Wednesday;
    normailizedHours.Thursday = item.Thursday
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Thursday;
    normailizedHours.Friday = item.Friday
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Friday;
    normailizedHours.Saturday = item.Saturday
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Saturday;
    normailizedHours.Sunday = item.Sunday
      ? normalizeHourString(item.Intervals[0])
      : normailizedHours.Sunday;
  });

  postHours(normailizedHours).then((data) => {
    console.log("addedHours", itemMeta.id);
    // getOrganizationInfo().then((data) => updateOrganizationsJson(data));
  });
}
function updateOrganizationMenu(itemMeta) {
  if (!itemMeta.menuPositions || itemMeta.menuPositions.length === 0) return;

  const normailizedMenu = {
    id: itemMeta.id,
    menuPositions:
      itemMeta.menuPositions?.reduce((reducer, menuItem) => {
        reducer.push([
          itemMeta.id,
          menuItem.category,
          menuItem.dishes
            .map(
              (item) =>
                `${item.title ? item.title : "empty"}|${
                  item.image ? item.image : "empty"
                }|${item.description ? item.description : "empty"}|${
                  item.price ? item.price : "empty"
                }`
            )
            .join("=+="),
        ]);
        return reducer;
      }, []) || null,
  };
  if (normailizedMenu.menuPositions?.dishes?.length !== 0)
    postMenu(normailizedMenu).then((data) => {
      console.log("addedMenu", itemMeta.id);
      // getOrganizationInfo().then((data) => updateOrganizationsJson(data));
    });
}

async function main() {
  const startData = await getNewDataFromApi();
  console.log("started");
  async function updateJson(item) {
    const itemCoords = item.geometry.coordinates;
    const itemProps = item.properties;
    const itemMeta = itemProps.CompanyMetaData;

    updateOrganizationInfo(itemCoords, itemProps, itemMeta);
    updateOrganizationHours(itemMeta);
    updateOrganizationMenu(itemMeta);
  }

  const tasksRunning = [];

  for (let i = 1; i < BROWSER_PAGES + 1; i++) {
    const sendData = [].concat(startData).reverse();
    const a = new Promise((resolve, reject) => {
      resolve(getOrganizationData(sendData, i, updateJson));
    });
    tasksRunning.push(a);
  }
  await Promise.all(tasksRunning).then(() => {
    closeAllBrowsers();
    main();
  });
}

main();
