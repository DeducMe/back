import fetch from "node-fetch";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export function getOrganizationInfo() {
  return fetch("https://localhost:8443/organization/info", {
    agent: httpsAgent,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((data) => data.json());
}

export function getOrganizationCoords() {
  fetch("https://localhost:8443/organization/coords", {
    agent: httpsAgent,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((data) => data.json());
}

export function postOrganization(body) {
  return fetch("https://localhost:8443/organization", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    agent: httpsAgent,
    method: "POST",
    body: JSON.stringify(body),
  }).then((data) => data.json());
}

function get() {
  fetch("https://localhost:8443/", {
    agent: httpsAgent,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((data) => data.json())
    .then((data) => console.log(data));
}
