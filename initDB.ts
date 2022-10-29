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
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hapi_meal.collectibles (
      collectible_id SERIAL PRIMARY KEY,
      collection_id INT NOT NULL, --  REFERENCES hapi_meal.collections
      image_uri TEXT NOT NULL,
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
    INSERT INTO hapi_meal.collections(collection_id, image_uri)
      VALUES
        (1, 'https://gateway.pinata.cloud/ipfs/QmbUubU8AuHH6mmcQX7rCHk1BwWaLcMbdc4LShoGJjjFZq'),
        (2, 'https://gateway.pinata.cloud/ipfs/QmcrKT88UhEJLCBugRiK9CVNQy7utK73bEuahxxUKWuP1h'),
        (3, 'https://gateway.pinata.cloud/ipfs/QmUhm2BEAkxEnENNDQmwjVeP1HXwuoF8zLfJH5GYK5qqCn'),
        (4, 'https://gateway.pinata.cloud/ipfs/xxxxxxxxx'),
        (5, 'https://gateway.pinata.cloud/ipfs/QmSv7gsq9kqY74h59cTB7NB7aZfUmVTaH9jJaiqgShFLJs'),
        (6, 'https://gateway.pinata.cloud/ipfs/QmNgVdCacUt8rkSp3k44LueckXcBfK8j6JZ2wFf6p2eBWe')
      `);
};

const main = async () => {
  await createTables();
  await populateTables();
  exit();
};

main();
