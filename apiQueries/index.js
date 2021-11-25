import fetch from "node-fetch";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const site = "https://bar-view-back.herokuapp.com";

export function getOrganizationInfo() {
  return fetch(`${site}/organization/info`, {
    agent: httpsAgent,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((data) => data.json());
}

export function getOrganizationCoords() {
  fetch(`${site}/organization/coords`, {
    agent: httpsAgent,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((data) => data.json());
}

export function postHours(body) {
  console.log(body);
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

function get() {
  fetch(`${site}/`, {
    agent: httpsAgent,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((data) => data.json())
    .then((data) => console.log(data));
}
