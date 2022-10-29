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

  // TODO: call lobster.create_account()

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

// GET A COLLECTION ITEM'S INFO BY ID
app.get("/collections/:collectionId", async (req, res) => {
  const collectionId = req.params.collectionId;

  const result = await pool.query(
    `SELECT image_uri, name, description FROM hapi_meal.collections WHERE collection_id = $1`,
    [collectionId]
  );

  if (result.rowCount == 1) {
    res.json({
      collectionId: collectionId,
      imageUri: result.rows[0].image_uri,
      name: result.rows[0].name,
      description: result.rows[0].description,
    });
  } else {
    res.status(404).send();
  }
});

// COLLECT AN ITEM OF A SPECIFIC COLLECTION
app.post("/collections/:collectionId", async (req, res) => {
  const collectionId = req.params.collectionId;
  // TODO: must be authed
  const userId = 1;

  // TODO: this should be a sql transaction

  // TODO: try/catch if user doesn't exist
  let result = await pool.query(
    `SELECT owner_id FROM hapi_meal.collectibles WHERE collection_id = $1 AND owner_id = $2`,
    [collectionId, userId]
  );

  if (result.rowCount == 0) {
    // TODO: call lobster.mint(collectionId, userId) if not collected by userId
    const tokenId = 1;

    // update db - insert row into collectibles
    await pool.query(`INSERT INTO hapi_meal.collectibles(collection_id, token_id, owner_id) VALUES($1, $2, $3)`, [
      collectionId,
      tokenId,
      userId,
    ]);

    // TODO: returns collectible info after claiming
    res.json({ success: "minted" });
  } else {
    // ERROR: already minted
    res.status(403).send();
  }
});

// LIST USER COLLECTIBLES
app.get("/collectibles", async (req, res) => {
  // NOTE: requires user being authed
  const userId = 1; // TODO: parse userId from auth token

  // go to database, get all collectibles from the user
  let result = await pool.query(
    `SELECT cb.collectible_id, cb.collection_id, cb.token_id, cb.owner_id, cl.image_uri, cl.name, cl.description FROM hapi_meal.collectibles cb INNER JOIN hapi_meal.collections cl ON cb.collection_id = cl.collection_id WHERE cb.owner_id = $1`,
    [userId]
  );

  let userCollectibles = [];

  for (let i = 0; i < result.rowCount; i++) {
    let item = result.rows[i];
    userCollectibles.push({
      collectibleId: item.collectible_id,
      collectibleName: item.name,
      collectibleDescription: item.description,
      collectibleUri: item.image_uri,
      collectionId: item.collection_id,
      tokenId: item.token_id,
    });
  }

  res.json(userCollectibles);
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

app.get("/", (req, res) => {
  res.send("hello, world!");
});

app.listen(port, () => {
  console.log(`HAPI MEAL BACKEND is running on port ${port}.`);
});
