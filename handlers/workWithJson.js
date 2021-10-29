import * as fs from "fs";

export async function updateOrganizationsJson(data) {
  await fs.writeFileSync("./data/dataTest.json", JSON.stringify(data, 0, 2));
}

export async function getOrganizationsJson() {
  return JSON.parse(fs.readFileSync("./data/myjsonfile.json", "utf-8"));
}
