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
        (0, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/crystal_skologna.png', 'Crystal Skologna', 'A sacred and lost item, a sausage derived from the Italian mortadella, crystalized & perfectly shaped into the image of a human skull. How was this cheese exacted with such precision? No one knows. Don''t be caught holding this precious relic when the creators return.'),
        (1, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/fry_guy.png', 'Fry Guy', 'You gotta bag? Is it secure? Fry guy wants your bag. Time to pay up. Guppies, shrimps, orcas, & whales... Fry Guy knows no bounds. Tiny Terror with the sauce & he is ready to dip you to oblivian.'),
        (2, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/loving_clown_parent.png', 'Loving Clown Parent', 'Hi sweaty, I''m so proud of you. I don''t care if you traded to zero by over leveraging your networth with algorithmic stable coins. You can always live in my basement, Muahehehehe.'),
        (3, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/master_chef.png', 'Master Chef', 'Terminal burger flipper gone Chef Supreme. You better hope Master Chef''s lost eyes appear in your take away. He''s always watching, anyway. Chop, chop!'),
        (4, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/murderous_arnold.jpeg', 'Murderous Arnold', 'This plastic toy is completely harmless as a digital collectible. However, should he appear in your bathroom mirror after you chant "Balmy Arnold" 3 times, there is no hiding from such an absolute creature.'),
        (5, 'https://gateway.pinata.cloud/ipfs/QmaG2mWs97E7FKhHC5G6VajZMaug2qnPbhgSwKHWvR6pW2/nose_man_brime_man.png', 'Nose Man Brim Man', 'Nose man haunts you with a single nostril, while brim man lurks in the distance. A satchel bag, or parachute pants, there is no espacing the immaculate style of these masked horrors.')
      `);
};

const main = async () => {
  await createTables();
  await populateTables();
  exit();
};

main();
