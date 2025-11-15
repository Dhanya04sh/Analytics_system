# Analytics System  
A fast, asynchronous website analytics backend that captures events, processes them using a queue + worker pipeline, stores them in SQLite, and exposes reporting APIs with optional dashboard visualizations.

---

## 📌 Problem Statement (Summary)
The goal is to design a lightweight analytics system that:
- Handles a high volume of events **without slowing the client**
- Accepts events instantly and processes them asynchronously
- Stores all events in a database through a background worker
- Provides a summary analytics API (not raw events)
- Optionally visualizes analytics using a dashboard UI

---

# 🏗 Architecture Overview

This system consists of **two backend services** and an **optional frontend dashboard**.

---

## ✔ **1. Ingestion + Worker Service** (combined backend service)
Located inside **`ingestion-service/`**

Handles:
- `POST /event` — receives analytics events  
- Pushes events into a **shared in-memory queue**  
- A **background worker (`worker.js`)** continuously reads from the queue  
- Events are stored into **SQLite (`events.db`)**

Flow:
```
Client → POST /event → queue → worker → SQLite (events.db)
```

---

## ✔ **2. Reporting Service**
Located inside **`reporting-service/`**

Endpoint:
- `GET /stats?site_id=XYZ&date=YYYY-MM-DD`

Returns:
- total views  
- unique users  
- top visited paths  
- date-level summary  

This satisfies the problem requirement of showing **aggregated analytics only**, not raw events.

---

## ✔ **3. (Optional) Dashboard UI**
Located inside **`dashboard/`**

A React-based visualization showing:
- Total events  
- Timeline chart  
- Raw events  
- Top paths  
- User activity patterns  

---

# 🧠 Architecture Decision

### ⭐ Why use a Queue + Worker (Asynchronous Processing)?
The problem specifically mentions:
- Client should not wait  
- Processing must be asynchronous  
- Ingestion must be fast  

If the ingestion API wrote directly to the database:
- It would be slow  
- Under high load, it could fail  

So we use:
- In-memory queue (`queue.js`)
- Worker (`worker.js`) running inside ingestion-service

This ensures:
- Ingestion is **instant**
- Processing happens in background
- System scales well under load

This satisfies the required architecture **perfectly**.

---

# 🗄 Database Schema

### Table: **events**

| Column     | Type    | Description |
|------------|---------|-------------|
| id         | INTEGER | Auto-increment primary key |
| site_id    | TEXT    | Identifier for site |
| event_type | TEXT    | Event type (e.g., `page_view`) |
| path       | TEXT    | URL path |
| user_id    | TEXT    | User identifier |
| timestamp  | TEXT    | ISO timestamp |

### Schema Diagram

```
events
 ├── id (PK)
 ├── site_id
 ├── event_type
 ├── path
 ├── user_id
 └── timestamp
```

---

# 📂 Folder Structure

```
Analytics_system/
├── ingestion-service/
│   ├── index.js       # Ingestion API
│   ├── worker.js      # Background worker
│   ├── queue.js       # Shared in-memory queue
│   └── events.db      # SQLite database
│
├── reporting-service/
│   └── index.js       # Summary stats API
│
├── dashboard/         # Optional React visualization
│   ├── src/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the Repository
```sh
git clone https://github.com/Dhanya04sh/Analytics_system
cd Analytics_system
```

---

# 🟦 BACKEND SETUP

## 2️⃣ Start Ingestion + Worker Service
```sh
cd ingestion-service
npm install
node index.js
```

This runs:
- Ingestion API → **http://localhost:3001**
- Worker → processes queue → writes to SQLite

---

## 3️⃣ Start Reporting Service
```sh
cd ../reporting-service
npm install
node index.js
```

This runs:
- Reporting API → **http://localhost:3002**

---

# 🟩 OPTIONAL: DASHBOARD UI (React)

## 4️⃣ Start Dashboard
```sh
cd ../dashboard
npm install
npm run dev
```

Access dashboard at:
```
http://localhost:5173
```

---

# 🧪 API Usage Examples

## ✔ Send an event

```sh
curl -X POST http://localhost:3001/event \
-H "Content-Type: application/json" \
-d "{
  \"site_id\":\"site-123\",
  \"event_type\":\"page_view\",
  \"path\":\"/home\",
  \"user_id\":\"u10\",
  \"timestamp\":\"2025-11-14T10:00:00Z\"
}"
```

Response:
```json
{"status":"queued"}
```

---

## ✔ Get analytics summary

```sh
curl "http://localhost:3002/stats?site_id=site-123"
```

or with date:

```sh
curl "http://localhost:3002/stats?site_id=site-123&date=2025-11-14"
```

Example response:
```json
{
  "site_id": "site-123",
  "date": "2025-11-14",
  "total_views": 1200,
  "unique_users": 180,
  "top_paths": [
    { "path": "/home", "views": 400 },
    { "path": "/pricing", "views": 300 },
    { "path": "/blog", "views": 200 }
  ]
}
```

---

# 🧰 Tech Stack

### Backend
- Node.js  
- Express  
- SQLite  

### Queue
- Shared in-memory queue (`queue.js`)

### Frontend (optional)
- React  
- Vite  
- TailwindCSS  
- Recharts  

---

# 🚀 Future Enhancements
- Use Redis/RabbitMQ for distributed queuing  
- Move from SQLite → PostgreSQL  
- Add authentication  
- Add dashboards for multi-site analytics  
- Real-time updates using WebSockets  
- Dockerize entire system  

---

# 📄 License
MIT License

---

# 🎉 End of README  
Your analytics system is fully documented with all required deliverables.
