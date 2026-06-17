const { Pool } = require("pg");

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "smart_apartment",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "", // Leave blank if no password
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error connecting to PostgreSQL:", err.stack);
  } else {
    console.log("✅ Connected to PostgreSQL successfully!");
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
