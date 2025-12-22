// server.js
// GOV COLLAB PORTAL – Backend skeleton

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();

// ---------- MIDDLEWARE ----------

app.use(express.json());

const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin,
  })
);

// ---------- BASIC HEALTH ROUTE ----------

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "GOV COLLAB PORTAL backend is running",
    time: new Date().toISOString(),
  });
});

// ---------- AUTH: VERY SIMPLE LOGIN (NO JWT YET) ----------
// IMPORTANT: For now this expects that you store the password in plain text
// in users.password_hash (prototype only). We'll upgrade to real hashing + tokens later.

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const result = await db.query(
      `
      SELECT id, full_name, email, role, password_hash, is_active
      FROM users
      WHERE username = $1
      LIMIT 1
    `,
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "User is inactive." });
    }

    // TEMP: plain-text comparison (prototype only)
    if (password !== user.password_hash) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // For now we just return a fake token and user info.
    // Later we will replace this with real sessions / JWT.
    const fakeToken = `dev-token-${user.id}`;

    res.json({
      token: fakeToken,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error in /api/login:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ---------- COUNTRIES ENDPOINT ----------

app.get("/api/countries", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, name_en AS name, code
      FROM countries
      WHERE is_active = TRUE
      ORDER BY name_en ASC
    `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error in /api/countries:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ---------- SAMPLE UPCOMING EVENTS ENDPOINT ----------

app.get("/api/events/upcoming", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        e.id,
        e.title,
        e.occasion,
        e.deadline_date,
        c.name_en AS country_name
      FROM events e
      JOIN countries c ON c.id = e.country_id
      WHERE e.is_active = TRUE
      ORDER BY e.deadline_date ASC
      LIMIT 20
    `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error in /api/events/upcoming:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ---------- START SERVER ----------

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GOV COLLAB PORTAL backend running on port ${PORT}`);
});
