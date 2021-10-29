import * as fs from "fs";

export async function updateOrganizationsJson(data) {
  await fs.writeFileSync(
    "./jsonData/dataTest.json",
    JSON.stringify(data, 0, 2)
  );
}

export async function getOrganizationsJson() {
  return JSON.parse(fs.readFileSync("./jsonData/myjsonfile.json", "utf-8"));
}
