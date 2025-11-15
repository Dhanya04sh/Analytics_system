const queue = require("./queue");
const sqlite3 = require("sqlite3").verbose();

// Create/open SQLite DB
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

console.log("WORKER queue loaded from:", require.resolve("./queue"));
console.log("Worker started...");

setInterval(() => {
  console.log("Queue length:", queue.length);

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
        event.timestamp,
      ]
    );
  }
}, 1000);
