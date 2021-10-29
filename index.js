import { launchPuppeteer, createNewPage } from "./helpers/puppeteer.js";
import getOrganizationFeatures from "./handlers/getOrganizationFeatures.js";
import getOrganizationImages from "./handlers/getOrganizationImages.js";
import getOrganizationMenu from "./handlers/getOrganizationMenu.js";
import {
  getOrganizationLogo,
  getOrganizationRating,
} from "./handlers/getOrganizationMain.js";
import {
  getOrganizationsJson,
  updateOrganizationsJson,
} from "./handlers/workWithJson.js";
import { findOrganization } from "./handlers/getOther.js";

const CITY = "Москва";
const ORGANIZATION_THEME = "Бар, паб";
const BROWSER_PAGES = 5;

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

    try {
      meta.features = await getOrganizationFeatures(page);
      meta.organizationImages = await getOrganizationImages(page);
      meta.menuPositions = await getOrganizationMenu(page);
    } catch {}
    console.log(dataIndex);
    updateJson(item);
  }
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

  for (let i = 1; i < BROWSER_PAGES + 1; i++) {
    await launchPuppeteer();
    getOrganizationData(data, i, updateJson);
  }

  // const organizationResult = await getOrganizations(ORGANIZATION_THEME);

  // await updateOrganizationsJson(organizationResult);

  // closeBrowser();
})();
