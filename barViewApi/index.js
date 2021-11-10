//module.js:
var fs = require("fs");

const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");

const port = process.env.PORT || 8443;

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => reciever(req, res, getAllRows));
app.get("/organization/coords", (req, res) => reciever(req, res, getCoords));
app.get("/organization/info", (req, res) =>
  reciever(req, res, getOrganizationInfo)
);

app.post("/organization", (req, res) => reciever(req, res, postOrganization));

app.listen(port, () => {
  console.log("Server is running on port ", port);
});

const conn = mysql.createConnection({
  host: "localhost",
  user: "deducMe",
  database: "barViewDatabase",
  password: "Pomogite1337!",
});

function reciever(req, res, func) {
  func((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers.",
      });
    else res.send(data);
  }, req.body);
}

function getOrganizationInfo(sendBack) {
  const sql =
    "SELECT name, address, url, phones, categories, rating, logo, menuFeatures, elseFeatures, organizationImages, menuPositions, userReviews from organizations";
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    sendBack(err, result);
  });
}

function getCoords(sendBack) {
  const sql = "SELECT coordinatesX, coordinatesY, id from organizations";
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    sendBack(err, result);
  });
}

function postOrganization(sendBack, data) {
  const sql = `SELECT id from organizations WHERE id=${data.id}`;
  conn.query(sql, function (err, result) {
    if (result.length > 0) {
      console.log("put org", data.id);
      putOrganization(sendBack, data);
    } else {
      console.log("insert org", data.id);
      insertOrganization(sendBack, data);
    }
  });
}

function putOrganization(sendBack, data) {
  const sqlQueryData = Object.values(data).map((item) => {
    if (Array.isArray(item)) {
      return item.join("|");
    }
    return item;
  });
  const sql = `UPDATE organizations SET coordinatesX = ?, coordinatesY = ?, name = ?, address = ?, id = ?, url = ?, phones = ?, categories = ?, rating = ?, logo = ?, menuFeatures = ?, elseFeatures = ?, organizationImages = ?, menuPositions = ?, userReviews = ?, reviewsCategories = ? WHERE id=${data.id}`;
  conn.query(sql, sqlQueryData, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    sendBack(err, result);
  });
}

function insertOrganization(sendBack, data) {
  const sqlQueryData = Object.values(data).map((item) => {
    if (Array.isArray(item)) {
      return item.join("|");
    }
    return item;
  });
  const sql = `INSERT INTO organizations (coordinatesX, coordinatesY, name, address, id, url, phones, categories, rating, logo, menuFeatures, elseFeatures, organizationImages, menuPositions, userReviews, reviewsCategories) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  conn.query(sql, sqlQueryData, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    sendBack(err, result);
  });
}

function getAllRows(sendBack) {
  const sql = "SELECT * from organizations";
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      return;
    }
    sendBack(err, result);
  });
}

function dropDatabase() {
  const sql = "DROP TABLE organizations";
  conn.query(sql, function (err, result) {
    if (err) {
      if (err.errno === 1050) console.log("table not destroyed");
      return;
    }
    console.log("Table destroyed");
  });
}

connectToDatabase = () => {
  conn.connect(function (err) {
    console.log("Connected!");

    const sql =
      "CREATE TABLE organizations (name VARCHAR(255), address VARCHAR(255), coordinatesX FLOAT, coordinatesY FLOAT, id VARCHAR(255), url VARCHAR(255), phones VARCHAR(255), categories VARCHAR(255),rating FLOAT, logo VARCHAR(255), menuFeatures TEXT, elseFeatures TEXT, organizationImages TEXT, menuPositions MEDIUMTEXT, userReviews MEDIUMTEXT, reviewsCategories TEXT)";
    conn.query(sql, function (err, result) {
      if (err) {
        if (err.errno === 1050) console.log("table already exist");
        else console.log(err);
        return;
      }
      console.log("Table created");
    });
  });
};

module.exports = { connectToDatabase };

// dropDatabase();
// setTimeout(() => {
// }, 1000);

// main();
