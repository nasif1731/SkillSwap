import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const FreelancerBidAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects/freelancer/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (!analytics) return <p className="p-4">Loading bid analytics...</p>;

  const { totalBids, averageBidPrice, highestBid, lowestBid, statusCounts } = analytics;

  const barData = {
    labels: ["Average", "Highest", "Lowest"],
    datasets: [
      {
        label: "Bid Amounts ($)",
        data: [averageBidPrice, highestBid, lowestBid],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Bid Status",
        data: Object.values(statusCounts),
        backgroundColor: ["#FBBF24", "#34D399", "#EF4444"],
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bid Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded shadow">
          <Bar data={barData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <Doughnut data={doughnutData} />
        </div>
      </div>
      <div className="mt-4 text-gray-700">
        <p><strong>Total Bids:</strong> {totalBids}</p>
        <p><strong>Average Price:</strong> ${averageBidPrice}</p>
        <p><strong>Highest:</strong> ${highestBid}</p>
        <p><strong>Lowest:</strong> ${lowestBid}</p>
      </div>
    </div>
  );
};

export default FreelancerBidAnalytics;
