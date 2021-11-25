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
  try {
    await page.click(".search-snippet-view__link-overlay");
  } catch {}
  try {
    await page.waitForSelector(".card-title-view__title-link");
  } catch {}
}
