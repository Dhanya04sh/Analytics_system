const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());

const db = new sqlite3.Database("../ingestion-service/events.db");

app.get("/events", (req, res) => {
  db.all("SELECT * FROM events", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(3002, () => console.log("Reporting API running on 3002"));
