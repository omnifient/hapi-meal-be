const crypto = require("crypto");
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import { Pool } from "pg";

// ----------------------------------------------------------------------------
// CONFIG
// ----------------------------------------------------------------------------
dotenv.config();

// express stuff
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const port = 3000;

// postgres stuff
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ----------------------------------------------------------------------------
// GLOBALS
// ----------------------------------------------------------------------------
const CLIENT_ID = 1;

// ----------------------------------------------------------------------------
// HANDLERS
// ----------------------------------------------------------------------------

// SIGN UP
app.post("/sign_up", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // store in db, generate user id
  // TODO: try/catch
  const result = await pool.query(`INSERT INTO hapi_meal.users(email, password) VALUES($1, $2) RETURNING user_id`, [
    email,
    password,
  ]);

  // extract user id and create jwt
  const userId = result.rows[0].user_id;
  const token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });

  res.json({ auth_token: token });
});

// SIGN IN
app.post("/sign_in", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // validate email and password against database and return jwt
  // TODO: try/catch
  const result = await pool.query(`SELECT user_id FROM hapi_meal.users WHERE email = $1 AND password = $2`, [
    email,
    password,
  ]);

  let token;
  if (result.rowCount == 1) {
    const userId = result.rows[0].user_id;
    token = jwt.sign({ user_id: userId }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
  } else {
    // TODO: return 401
  }

  res.json({ auth_token: token });
});

// GET COLLECTION INFO BY ID
app.get("/collections/:collectionId", async (req, res) => {
  const collectionId = req.params.collectionId;

  const result = await pool.query(`SELECT image_uri, name FROM hapi_meal.collections WHERE collection_id = $1`, [
    collectionId,
  ]);

  if (result.rowCount == 1) {
    const imageUri = result.rows[0].image_uri;
    const name = result.rows[0].name;
    res.json({ collectionId: collectionId, imageUri: imageUri, name: name });
  } else {
    res.status(404).send();
  }
});

// COLLECT AN ITEM OF A SPECIFIC COLLECTION
app.post("/collections/:collectionId", (req, res) => {
  // TODO: must be authed
  // if not collected by userId, then call lobster.mint(collectionId, userId)

  // returns collectible info after claiming
  res.json({});
});

// GET COLLECTIBLE INFO
app.get("/colectibles/:collectibleId", (req, res) => {
  // return info for collectibleId

  res.json({
    collectibleId: "123",
    collectibleName: "blah blah",
    collectibleUri: "uri of the image",
    claimed: "true or false if authed/already owned by userId",
  });
});

// SEND COLLECTIBLE
app.put("/collectibles/:collectibleId/send/email", (req, res) => {
  // if email belongs to an existing user
  // get userId from email
  // transfer collectibleId to userId
  // else
  // send an email to targetEmail with qr code to redeem collectibleId

  res.json({});
});

// LIST COLLECTION
app.get("/collectibles", (req, res) => {
  // get collectibles
  // go to database, get all collectibles from the collection
  // collectible == {id, uri, name}
  // if authed, collected == isCollected?
});

app.get("/", (req, res) => {
  res.send("hello, world!");
});

app.listen(port, () => {
  console.log(`HAPI MEAL BACKEND is running on port ${port}.`);
});
