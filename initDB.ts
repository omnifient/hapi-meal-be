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
      updated_at TIMESTAMP NOT NULL DEFAULT NOW())
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hapi_meal.collectibles (
      collectible_id SERIAL PRIMARY KEY,
      collection_id INT DEFAULT 1,
      token_id INT NULL,
      owner_id INT NOT NULL REFERENCES hapi_meal.users,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW())
  `);
};

const populateTables = async () => {
  console.log("populating tables");

  // await pool.query(`
  //   INSERT INTO collections (client_id, contract_address)
  //     VALUES
  //       (1, '0x123456789'),
  //       (1, '0x0987654321')
  //     `);
};

const main = async () => {
  await createTables();
  await populateTables();
  exit();
};

main();
