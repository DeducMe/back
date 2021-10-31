import {
  launchPuppeteer,
  createNewPage,
  closeBrowser,
  closeAllBrowsers,
} from "./helpers/puppeteer.js";
import getOrganizationFeatures from "./handlers/getOrganizationFeatures.js";
import getOrganizationReviews from "./handlers/getOrganizationReviews.js";
import getOrganizationImages from "./handlers/getOrganizationImages.js";
import getOrganizationMenu from "./handlers/getOrganizationMenu.js";
import {
  getOrganizationLogo,
  getOrganizationRating,
  getOrganizationSpecialOffers,
} from "./handlers/getOrganizationMain.js";
import {
  getOrganizationsJson,
  getNewDataJson,
  updateOrganizationsJson,
} from "./handlers/workWithJson.js";
import { findOrganization } from "./handlers/getOther.js";

const CITY = "Москва";
const ORGANIZATION_THEME = "Бар, паб";
const BROWSER_PAGES = 2;

const SITE = "https://yandex.ru/maps/?ll=37.736061%2C55.737109&z=9.4";

async function getOrganizationData(json, browserIndex, updateJson) {
  const page = await createNewPage(SITE, browserIndex - 1);

  for (
    let dataIndex = browserIndex - 1;
    dataIndex < json.length;
    dataIndex = dataIndex + BROWSER_PAGES
  ) {
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
}

(async function main() {
  const startData = await getNewDataJson();

  async function updateJson(item) {
    const newData = await getNewDataJson();

    const oldItemIndex = newData.findIndex(
      (el) =>
        el.properties.CompanyMetaData.id === item.properties.CompanyMetaData.id
    );
    if (oldItemIndex !== -1) {
      newData[oldItemIndex] = item;
    } else newData.push(item);
    updateOrganizationsJson(newData);
  }

  const browserOpened = [];

  for (let i = 1; i < BROWSER_PAGES + 1; i++) {
    await launchPuppeteer();
    const sendData = [].concat(startData).reverse();
    const a = new Promise((resolve, reject) => {
      resolve(getOrganizationData(startData, i, updateJson));
    });
    browserOpened.push(a);
  }
  await Promise.all(browserOpened).then(closeAllBrowsers);

  // const organizationResult = await getOrganizations(ORGANIZATION_THEME);

  // await updateOrganizationsJson(organizationResult);

  // closeBrowser();
})();
