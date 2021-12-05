import fetch from "node-fetch";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const site = "https://bar-view-back.herokuapp.com";

export function postMenu(body) {
  return fetch(`${site}/organization/menu`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    agent: httpsAgent,
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    console.log(data.status);
  });
}

export function postHours(body) {
  return fetch(`${site}/organization/hours`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    agent: httpsAgent,
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    console.log(data.status);
  });
}

export function postOrganization(body) {
  return fetch(`${site}/organization`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    agent: httpsAgent,
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => {
    console.log(data.status);
  });
}
