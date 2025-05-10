import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const FreelancerProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [progressChanges, setProgressChanges] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects/freelancer/my-projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to fetch freelancer projects", err);
      }
    };

    fetchProjects();
  }, []);

  const handleProgressChange = (projectId, value) => {
    setProgressChanges((prev) => ({
      ...prev,
      [projectId]: Number(value),
    }));
  };

  const updateProgress = async (projectId) => {
    const progress = progressChanges[projectId];
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress }),
      });

      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p._id === projectId ? { ...p, progress } : p
          )
        );
        toast.success("Progress updated!");
      } else {
        toast.error("Failed to update progress.");
      }
    } catch (err) {
      console.error("Error updating progress", err);
      toast.error("Server error.");
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Projects</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        filteredProjects.map((project) => (
          <div key={project._id} className="bg-white shadow rounded p-4 mb-4">
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="text-gray-700">{project.description}</p>
            <p className="text-sm text-gray-500">Status: {project.status}</p>
            <p className="text-sm text-gray-500">Client: {project.client?.name}</p>

            {project.status === "in-progress" && (
              <div className="mt-4">
                <label className="block font-medium mb-1">Progress:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressChanges[project._id] ?? project.progress ?? 0}
                  onChange={(e) => handleProgressChange(project._id, e.target.value)}
                  className="w-full"
                />
                <p className="text-sm mt-1">
                  {progressChanges[project._id] ?? project.progress ?? 0}%
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => updateProgress(project._id)}
                >
                  Update Progress
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FreelancerProjectsPage;
