import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const FreelancerSearchPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    expertise: "",
    minExperience: "",
    minRating: "",
  });

  const fetchFreelancers = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams(filters).toString();
      const { data } = await axios.get(
        `http://localhost:5000/api/users/freelancers?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFreelancers(data.freelancers || []);
      setFiltered(data.freelancers || []);
    } catch (error) {
      toast.error("Error fetching freelancers");
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filteredResults = freelancers.filter(
      (f) =>
        f.user?.name?.toLowerCase().includes(value) ||
        f.skills?.join(" ").toLowerCase().includes(value)
    );

    setFiltered(filteredResults);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchFreelancers();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Find Freelancers
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          name="expertise"
          value={filters.expertise}
          onChange={handleFilterChange}
          className="p-3 border rounded-lg"
        >
          <option value="">All Expertise</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Expert">Expert</option>
        </select>

        <input
          type="number"
          name="minExperience"
          value={filters.minExperience}
          onChange={handleFilterChange}
          placeholder="Min Experience (years)"
          className="p-3 border rounded-lg"
        />

        <input
          type="number"
          name="minRating"
          value={filters.minRating}
          onChange={handleFilterChange}
          placeholder="Min Rating"
          className="p-3 border rounded-lg"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={applyFilters}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
        <input
          type="text"
          placeholder="Search by name or skill..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1 p-3 border rounded-lg shadow-sm"
        />
      </div>

      {/* Freelancer Cards */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No freelancers found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((freelancer) => (
            <div
              key={freelancer._id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold text-gray-800">
                {freelancer.user?.name}
              </h2>
              <p className="text-gray-600 text-sm">{freelancer.user?.email}</p>

              <p className="mt-2 text-sm text-blue-600 font-medium">Skills:</p>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {freelancer.skills?.length > 0 ? (
                  freelancer.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))
                ) : (
                  <li>No skills listed</li>
                )}
              </ul>

              <p className="mt-2 text-sm">
                Expertise:{" "}
                <span className="font-semibold">{freelancer.expertise}</span>
              </p>
              <p className="text-sm">
                Experience: {freelancer.experience} years
              </p>

              {/* ⭐ Average Rating UI */}
              <div className="flex items-center mt-2 gap-1 text-sm">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    {i < Math.round(freelancer.averageRating || 0) ? "★" : "☆"}
                  </span>
                ))}
                <span className="ml-1 text-gray-600">
                  {freelancer.averageRating
                    ? `${freelancer.averageRating.toFixed(1)} / 5`
                    : "No ratings yet"}
                </span>
                {freelancer.reviewCount > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({freelancer.reviewCount} reviews)
                  </span>
                )}
              </div>

              <p className="mt-2 text-green-600 text-sm font-semibold">
                {freelancer.verified
                  ? "✅ Verified"
                  : "⏳ Pending Verification"}
              </p>

              {freelancer.user?._id && (
                <div className="mt-3 flex justify-between items-center">
                  <a
                    href={`/dashboard/chat/${freelancer.user._id}`}
                    className="text-blue-600 underline text-sm hover:text-blue-800"
                  >
                    💬 Chat Now
                  </a>
                  {/* Developer helper to display user ID */}
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="font-mono">freelancer.user._id:</span>{" "}
                    {freelancer.user?._id}
                  </p>
                  <a
                    href={`/freelancers/${freelancer.user._id}`}
                    className="text-sm text-gray-700 underline hover:text-black"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerSearchPage;
