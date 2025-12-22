// db.js
// Simple PostgreSQL helper using connection string from env

const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] DATABASE_URL is not set. Database queries will fail until you configure it."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional SSL config – uncomment if your provider requires it
  // ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  query,
  pool,
};
