import cherio from "cherio";
import { getContent } from "../helpers/puppeteer.js";

export default async function getOrganizationFeatures(page) {
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
