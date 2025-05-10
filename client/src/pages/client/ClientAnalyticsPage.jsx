import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { saveAs } from "file-saver";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ClientAnalyticsPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams();
      if (fromDate) query.append("from", fromDate);
      if (toDate) query.append("to", toDate);
  
      const res = await axios.get(
        `http://localhost:5000/api/analytics/client-dashboard?${query.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };
  useEffect(() => {
    fetchAnalytics();
  }, []);
  

  const exportCSV = () => {
    const header = ["Freelancer,Projects Completed,Avg Rating"];
    const rows = analytics.freelancerStats.map(
      (f) => `${f.name},${f.projects},${f.avgRating}`
    );
    const csvContent = header.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "freelancer_analytics.csv");
  };

  const barData = {
    labels: analytics?.freelancerStats.map((f) => f.name),
    datasets: [
      {
        label: "Projects Completed",
        data: analytics?.freelancerStats.map((f) => f.projects),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const pieData = {
    labels: analytics?.freelancerStats.map((f) => f.name),
    datasets: [
      {
        label: "Average Rating",
        data: analytics?.freelancerStats.map((f) => f.avgRating),
        backgroundColor: ["#4ade80", "#60a5fa", "#facc15", "#f87171"],
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📊 Client Analytics Dashboard</h1>

      {/* Date Range Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply Filter
        </button>
        {analytics && (
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Charts */}
      {analytics ? (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Projects per Freelancer</h2>
            <Bar data={barData} />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Average Rating</h2>
            <Pie data={pieData} />
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No analytics data loaded.</p>
      )}
    </div>
  );
};

export default ClientAnalyticsPage;
