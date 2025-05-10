import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import FreelancerBidAnalytics from "../components/freelancer/FreelancerBidAnalytics";
import Chart from "chart.js/auto";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalEarnings: 0,
    trend: [],
    popularSkills: [],
  });
  
  const [latestNotification, setLatestNotification] = useState(null);
  console.log("🔔 Latest notification object:", latestNotification);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      navigate("/login");
      return;
    }

    setRole(userData?.role || "");
    setUser(userData || {});

    const fetchClientProjects = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/projects/my-projects",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const active = res.data.projects.filter(
          (p) => p.status === "in-progress" || p.status === "open"
        );
        setProjects(active);
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };

    const fetchFreelancerBids = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/projects/freelancer/my-bids",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBids(res.data.bids || []);
      } catch (error) {
        console.error("Error fetching bids", error);
      }
    };

    const fetchAdminAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        const data = res.data;
        console.log("📊 Admin analytics data:", data);
    
        setAnalytics({
          totalUsers: data.users,
          totalProjects: data.projects,
          totalEarnings: data.earnings,
          trend: data.trend || [],
          popularSkills: data.popularSkills || [],
        });
      } catch (error) {
        console.error("Error fetching analytics", error);
      }
    };
    

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const all = res.data.notifications || [];
        const unread = all.filter((n) => !n.isRead);
        setUnreadCount(unread.length);

        const userData = JSON.parse(localStorage.getItem("user"));
        const loggedInUserId = userData?._id;
        console.log("👤 Logged in user ID:", loggedInUserId);
        console.log(
          "🔔 All notifications (system):",
          all.filter((n) => n.type === "system")
        );

        const deadlineReminder = [...all]
          .reverse()
          .find((n) => n.type === "system" && n.user === loggedInUserId);

        setLatestNotification(deadlineReminder || null);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    const fetchData = async () => {
      if (userData?.role === "client") await fetchClientProjects();
      if (userData?.role === "freelancer") await fetchFreelancerBids();
      if (userData?.role === "admin") await fetchAdminAnalytics();
      await fetchNotifications();
      setLoading(false);
    };

    fetchData();
  }, [navigate]);
  useEffect(() => {
    if (role === "admin") {
      if (analytics.trend.length && document.getElementById("trendChart")) {
        new Chart(document.getElementById("trendChart").getContext("2d"), {
          type: "line",
          data: {
            labels: analytics.trend.map((t) => t.month),
            datasets: [
              {
                label: "User Signups",
                data: analytics.trend.map((t) => t.users),
                borderColor: "blue",
                fill: false,
                tension: 0.3,
              },
            ],
          },
        });
      }

      if (
        analytics.popularSkills.length &&
        document.getElementById("skillsChart")
      ) {
        new Chart(document.getElementById("skillsChart").getContext("2d"), {
          type: "bar",
          data: {
            labels: analytics.popularSkills.map((s) => s._id),
            datasets: [
              {
                label: "Freelancers",
                data: analytics.popularSkills.map((s) => s.count),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
            ],
          },
        });
      }
    }
  }, [analytics, role]);

  if (loading)
    return <div className="p-8 text-xl font-semibold">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-white via-blue-50 to-white shadow-2xl p-6 hidden md:flex flex-col space-y-8">
        <h2 className="text-3xl font-extrabold text-blue-700 tracking-wide">
          SkillSwap
        </h2>
        <nav className="flex flex-col gap-4">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg transition-all font-medium"
          >
            Dashboard
          </Link>

          {/* Shared: Messages */}
          {(role === "client" || role === "freelancer") && (
            <Link
              to="/dashboard/messages"
              className="flex items-center justify-between text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <FaBell className="text-yellow-500" />
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {role === "client" && (
            <>
              <Link
                to="/dashboard/post-project"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                Post Project
              </Link>
              <Link
                to="/dashboard/my-projects"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                My Projects
              </Link>
              <Link
                to="/dashboard/freelancers"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                Find Freelancers
              </Link>
              <Link
                to="/dashboard/analytics"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                📊 Analytics Dashboard
              </Link>
            </>
          )}

          {role === "freelancer" && (
            <>
              <Link
                to="/dashboard/browse-projects"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                Browse Projects
              </Link>
              <Link
                to="/dashboard/my-bids"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                My Bids
              </Link>

              <Link
                to="/freelancers/my-projects"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                My Projects
              </Link>
              <Link
                to={`/freelancers/me`}
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                My Profile
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                to="/admin/verify-freelancers"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                Verify Freelancers
              </Link>
              <Link
                to="/dashboard/users"
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-600 py-2 px-4 rounded-lg"
              >
                All Users
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">
          Welcome, {user?.name} 🎯
        </h1>

        {role === "client" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-bold text-blue-600 mb-2">
                Active Projects
              </h2>
              <p className="text-gray-600 text-2xl font-bold">
                {projects.length}
              </p>
            </div>
          </div>
        )}
        {role === "freelancer" && latestNotification && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 shadow-md rounded-md">
            🔔 <strong>Reminder:</strong> {latestNotification.message}
          </div>
        )}

        {role === "freelancer" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-bold text-green-600 mb-2">My Bids</h2>
              <p className="text-gray-600 text-2xl font-bold">{bids.length}</p>
            </div>
          </div>
        )}
        {role === "freelancer" && <FreelancerBidAnalytics />}

        {role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-bold text-purple-600 mb-2">
                Total Users
              </h2>
              <p className="text-gray-600 text-2xl font-bold">
                {analytics.totalUsers}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-bold text-blue-600 mb-2">
                Total Projects
              </h2>
              <p className="text-gray-600 text-2xl font-bold">
                {analytics.totalProjects}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-bold text-green-600 mb-2">
                Total Earnings
              </h2>
              <p className="text-gray-600 text-2xl font-bold">
                ${analytics.totalEarnings}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                📈 User Growth Trend
              </h2>
              <canvas id="trendChart" height="150"></canvas>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-bold text-green-700 mb-4">
                🔥 Top 5 Popular Skills
              </h2>
              <canvas id="skillsChart" height="150"></canvas>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
