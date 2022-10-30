import cors from "cors";
const crypto = require("crypto");
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import { Pool } from "pg";

import { authenticateToken, createCollectiblePayload } from "./helpers";
import { createUserAccount, mintCollectible, transferCollectibleToAddress, transferCollectibleToUser } from "./lobster";

// ----------------------------------------------------------------------------
// CONFIG
// ----------------------------------------------------------------------------
dotenv.config();

// express stuff
const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const port = process.env.PORT || 80;

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
// HANDLERS
// ----------------------------------------------------------------------------

// SIGN UP
app.post("/sign_up", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // TODO: this should be a sql transaction
  try {
    // store in db, generate user id
    const result = await pool.query(`INSERT INTO hapi_meal.users(email, password) VALUES($1, $2) RETURNING user_id`, [
      email,
      password,
    ]);
    const userId = result.rows[0].user_id;

    // create a wallet for the user with lobster
    const userAccount = await createUserAccount(userId);

    //generate auth token with user id and wallet address
    const token = jwt.sign({ user_id: userId, address: userAccount.address }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60,
    });

    // extract user id and create wallet
    res.json({ auth_token: token });
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
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
    res.json({ auth_token: token });
  } else {
    // TODO: return 401
    res.status(401).send();
  }
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
    const tokenId = (await mintCollectible(userId, collectionId)).tokenId;

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
app.put("/collectibles/:collectibleId/send/email", authenticateToken, async (req, res) => {
  const fromUserId = req.user.user_id;
  const toEmail = req.body.toEmail;
  const collectibleId = req.params.collectibleId;

  let result = await pool.query(
    `SELECT token_id FROM hapi_meal.collectibles WHERE collectible_id = $1 AND owner_id = $2`,
    [collectibleId, fromUserId]
  );
  if (result.rowCount != 1) return res.status(404).send();
  const tokenId = result.rows[0].token_id;

  result = await pool.query(`SELECT user_id FROM hapi_meal.users WHERE email = $1`, [toEmail]);
  if (result.rowCount == 1) {
    const toUserId = result.rows[0].user_id;

    result = await transferCollectibleToUser(fromUserId, toUserId, tokenId);
    console.log(result);

    res.status(200).send();
  } else {
    // TODO: next sprint
    // send an email to targetEmail with qr code to redeem collectibleId
    res.status(202).send(); // TODO: TBI
  }
});

// SEND COLLECTIBLE TO ADDRESS
app.put("/collectibles/:collectibleId/send/address", authenticateToken, async (req, res) => {
  const fromUserId = req.user.user_id;
  const toAddress = req.body.toAddress;
  const collectibleId = req.params.collectibleId;

  let result = await pool.query(
    `SELECT token_id FROM hapi_meal.collectibles WHERE collectible_id = $1 AND owner_id = $2`,
    [collectibleId, fromUserId]
  );
  if (result.rowCount != 1) return res.status(404).send();
  const tokenId = result.rows[0].token_id;

  result = await transferCollectibleToAddress(fromUserId, toAddress, tokenId);
  console.log(result);

  res.status(200).send();
});

// EXPORT USER's ALL COLLECTIBLES TO ANOTHER WALLET
app.post("/export", authenticateToken, async (req, res) => {
  const userId = req.user.user_id;
  const walletAddress = req.body.walletAddress;

  // TODO: get all collectibles for user
  // TODO: get contract address

  // TODO: call lobster.export(...)

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
