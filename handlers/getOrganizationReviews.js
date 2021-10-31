import cherio from "cherio";
import { getContent } from "../helpers/puppeteer.js";

export default async function getOrganizationReviews(page) {
  try {
    await page.waitForSelector("._name_reviews", {
      timeout: 3000,
    });
    await page.click("._name_reviews");

    await page.waitForTimeout(100);
    try {
      await page.waitForSelector(".card-section-header__title", {
        timeout: 2000,
      });
    } catch {
      await page.waitForSelector(".business-rating-amount-view", {
        timeout: 2000,
      });
    }
  } catch {
    try {
      await page.waitForSelector("._name_reviews", {
        timeout: 3000,
      });
      await page.click("._name_reviews");

      try {
        await page.waitForSelector(".card-section-header__title", {
          timeout: 2000,
        });
      } catch {
        await page.waitForSelector(".business-rating-amount-view", {
          timeout: 2000,
        });
      }
    } catch (e) {
      console.log("no reviews");

      return;
    }
  }
  await page.waitForTimeout(500);
  const blockItemAmount = await page.evaluate(
    (el) => parseInt(document.querySelector(el).textContent),
    ".business-reviews-card-view__title .card-section-header__title"
  );

  for (let i = 0; i < (blockItemAmount > 300 ? 300 : blockItemAmount); i++) {
    await page.evaluate(
      (selector, i) => {
        const element = document.getElementsByClassName(selector)[i];
        if (element) element.scrollIntoView();
      },
      "business-reviews-card-view__review",
      i
    );
    await page.waitForTimeout(50);
  }

  const pageContent = await getContent(page);
  const $ = cherio.load(pageContent);
  const reviews = {};
  reviews.userReviews = [];
  reviews.reviewsCategories = [];
  reviews.ratedAmount = $(".business-rating-amount-view").text();
  reviews.reviewsAmount = $(".card-section-header__title").text();

  $(".business-aspects-view__item").each((i, el) => {
    const reviewCategoryElement = {};
    reviewCategoryElement.title = $(
      ".business-aspects-view__item-title",
      el
    ).text();
    reviewCategoryElement.reviewsAmount = $(
      ".business-aspects-view__item-reviews",
      el
    ).text();
    reviewCategoryElement.reviewsLinePositive = $(
      ".business-aspects-view__line-positive",
      el
    )
      .css()
      .flex.slice(0, -5);
    reviewCategoryElement.reviewsLineNegative = $(
      ".business-aspects-view__line-negative",
      el
    )
      .css()
      .flex.slice(0, -5);

    reviews.reviewsCategories.push(reviewCategoryElement);
  });

  $(".business-review-view__info").each((i, el) => {
    const userReviewsItem = {};
    userReviewsItem.text = $(".business-review-view__body-text", el).text();
    userReviewsItem.author = $(".business-review-view__author", el)
      .children("a")
      .eq(0)
      .text();
    $("._empty", el).each((i, el) => $(el).remove());

    userReviewsItem.stars = $(".business-rating-badge-view__star", el).length;
    reviews.userReviews.push(userReviewsItem);
  });
  console.log(reviews.userReviews.length);

  await page.waitForTimeout(100);
  return reviews;
}
