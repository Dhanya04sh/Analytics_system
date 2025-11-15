import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3002/events");
        const data = await res.json();

        console.log("API data:", data); // Debug

        // Map data: try multiple possible count fields
        const formattedData = data.map((item) => ({
          timestamp: item.timestamp || item.time || item.date || "Unknown",
          count: Number(item.count ?? item.value ?? item.events ?? 0),
        }));

        setEvents(formattedData);
        setTotalCount(formattedData.reduce((sum, e) => sum + e.count, 0));
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Live updates
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Total Events */}
      <div className="mb-6">
        <div className="bg-white p-6 rounded shadow flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Total Events</h2>
            <p className="text-4xl font-bold">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Timeline Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={events}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Raw Event Viewer */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Raw Event Viewer</h2>
        <pre className="overflow-x-auto max-h-64">{JSON.stringify(events, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Dashboard;
