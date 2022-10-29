const crypto = require("crypto");
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import { Pool } from "pg";

import { authenticateToken, createCollectiblePayload } from "./helpers";

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
const LOBSTER_CLIENT_ID = 1; // NOTE: hardcoded

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
app.post("/collections/:collectionId", authenticateToken, async (req, res) => {
  // NOTE: requires user being authed

  const collectionId = req.params.collectionId;
  const userId = req.user.user_id;

  // TODO: this should be a sql transaction

  let result = await pool.query(
    `SELECT owner_id FROM hapi_meal.collectibles WHERE collection_id = $1 AND owner_id = $2`,
    [collectionId, userId]
  );

  if (result.rowCount == 0) {
    // TODO: call lobster.mint(collectionId, userId) if not collected by userId
    const tokenId = 1;

    // update db - insert row into collectibles
    result = await pool.query(
      `INSERT INTO hapi_meal.collectibles(collection_id, token_id, owner_id) VALUES($1, $2, $3) RETURNING collectible_id`,
      [collectionId, tokenId, userId]
    );
    // NOTE: this should never happen, otherwise minted NFT is not associated with the user
    if (result.rowCount != 1) return res.status(500).send();

    // re-query db for collectible data
    result = await pool.query(
      `SELECT cb.collectible_id, cb.collection_id, cb.token_id, cb.owner_id, cl.image_uri, cl.name, cl.description FROM hapi_meal.collectibles cb INNER JOIN hapi_meal.collections cl ON cb.collection_id = cl.collection_id WHERE cb.owner_id = $1 AND cb.collectible_id = $2`,
      [
        req.user.user_id, // parse userId from auth token
        result.rows[0].collectible_id,
      ]
    );

    // returns collectible info after claiming
    res.json(createCollectiblePayload(result.rows[0]));
  } else {
    // ERROR: already minted
    res.status(403).send();
  }
});

// LIST USER COLLECTIBLES
app.get("/collectibles", authenticateToken, async (req, res) => {
  // NOTE: requires user being authed

  // go to database, get all collectibles from the user
  let result = await pool.query(
    `SELECT cb.collectible_id, cb.collection_id, cb.token_id, cb.owner_id, cl.image_uri, cl.name, cl.description FROM hapi_meal.collectibles cb INNER JOIN hapi_meal.collections cl ON cb.collection_id = cl.collection_id WHERE cb.owner_id = $1`,
    [req.user.user_id] // parse userId from auth token
  );

  let userCollectibles = [];

  for (let i = 0; i < result.rowCount; i++) {
    userCollectibles.push(createCollectiblePayload(result.rows[i]));
  }

  res.json(userCollectibles);
});

// SEND COLLECTIBLE TO EMAIL
app.put("/collectibles/:collectibleId/send/email", (req, res) => {
  // if email belongs to an existing user
  // get userId from email
  // transfer collectibleId to userId
  // else
  // send an email to targetEmail with qr code to redeem collectibleId

  res.json({});
});

// SEND COLLECTIBLE TO ADDRESS
app.put("/collectibles/:collectibleId/send/address", (req, res) => {
  const walletAddress = req.body.walletAddress;

  // TODO: TBI

  res.json({});
});

app.get("/", (req, res) => {
  res.send("hello, world!");
});

app.listen(port, () => {
  console.log(`HAPI MEAL BACKEND is running on port ${port}.`);
});

process.on("SIGTERM", () => {
  pool.end();
});
