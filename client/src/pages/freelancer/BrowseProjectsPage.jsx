import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BrowseProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const openProjects = data.projects.filter(p => p.status === "open");
        setProjects(openProjects);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };

    fetchProjects();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Browse Open Projects</h2>
      {projects.length === 0 ? (
        <p>No open projects available at the moment.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project._id}
            className="bg-white border p-4 rounded shadow mb-4"
          >
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="text-gray-700 mb-2">{project.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Client: {project.client?.name || "N/A"}
            </p>
            <Link
              to={`/dashboard/projects/${project._id}`}
              className="text-blue-600 hover:underline"
            >
              View & Submit Bid
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default BrowseProjectsPage;
