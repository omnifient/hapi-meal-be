import { Pool } from "pg";
import dotenv from "dotenv";
import { exit } from "process";

dotenv.config();

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

const createTables = async () => {
  console.log("creating tables");

  await pool.query(`CREATE SCHEMA IF NOT EXISTS hapi_meal`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hapi_meal.users (
      user_id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, -- TODO: DONT DO THIS, LOL
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hapi_meal.collections (
      collection_id INT NOT NULL PRIMARY KEY,
      image_uri TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hapi_meal.collectibles (
      collectible_id SERIAL PRIMARY KEY,
      collection_id INT NOT NULL, --  REFERENCES hapi_meal.collections
      token_id INT NULL,
      owner_id INT NOT NULL REFERENCES hapi_meal.users,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
};

const populateTables = async () => {
  console.log("populating tables");

  // initialize collection
  await pool.query(`
    INSERT INTO hapi_meal.collections(collection_id, image_uri, name, description)
      VALUES
        (0, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/crystal_skologna.png', 'crystal skologna', ''),
        (1, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/fry_guy.png', 'fry guy', ''),
        (2, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/loving_clown_parent.png', 'loving clown parent', ''),
        (3, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/master_chef.png', 'master chef', ''),
        (4, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/murderous_arnold.jpeg', 'murderous arnold', ''),
        (5, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/nose_man_brime_man.png', 'nose man brime man', '')
      `);
};

const main = async () => {
  await createTables();
  await populateTables();
  exit();
};

main();
