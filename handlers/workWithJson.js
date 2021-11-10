import * as fs from "fs";
import fetch from "node-fetch";

export async function updateOrganizationsJson(data) {
  await fs.writeFileSync("./jsonData/data.json", JSON.stringify(data, 0, 2));
}

export async function getOrganizationsJson() {
  return JSON.parse(fs.readFileSync("./jsonData/myjsonfile.json", "utf-8"));
}

export async function getNewDataJson() {
  return JSON.parse(fs.readFileSync("./jsonData/dataTest.json", "utf-8"));
}

export async function getNewDataFromApi() {
  const wR = [];

  for (let index = 0; index < 2; index++) {
    await fetch(
      `https://search-maps.yandex.ru/v1/?text=Бар&type=biz&results=2000&skip=${
        index * 500
      }&lang=ru_RU&ll=37.6,55.7&spn=0.8,0.8&&apikey=c63cba92-1973-49ab-9c45-943c69b15467`
    )
      .then((response) => {
        try {
          return response.json();
        } catch {}
      })
      .then((data) => {
        data?.features?.map((item) => {
          wR.push(item);
        });
      });
    console.log(wR);
  }

  return wR;
}
