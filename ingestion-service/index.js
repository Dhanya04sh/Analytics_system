const express = require("express");
const cors = require("cors");
const queue = require("./queue");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(cors());

// SQLite setup
const db = new sqlite3.Database("./events.db");
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id TEXT,
    event_type TEXT,
    path TEXT,
    user_id TEXT,
    timestamp TEXT
  )
`);

console.log("Queue loaded from:", require.resolve("./queue"));

// Ingestion endpoint
app.post("/event", (req, res) => {
  const event = req.body;

  if (!event.site_id || !event.event_type) {
    return res.status(400).json({ error: "site_id and event_type required" });
  }

  queue.push(event);

  console.log("Event added. Queue length:", queue.length);

  res.json({ status: "queued" });
});

// Worker logic (runs inside SAME process)
setInterval(() => {
  if (queue.length > 0) {
    const event = queue.shift();
    console.log("Processing event:", event);

    db.run(
      `INSERT INTO events (site_id, event_type, path, user_id, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [
        event.site_id,
        event.event_type,
        event.path,
        event.user_id,
        event.timestamp
      ]
    );
  } else {
    console.log("Queue length:", queue.length);
  }
}, 1000);

app.listen(3001, () => console.log("Ingestion + Worker running on 3001"));
