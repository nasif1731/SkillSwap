import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const token = localStorage.getItem("token");

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/projects/my-projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjects(res.data.projects || []);
    } catch (error) {
      toast.error("Failed to load your projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project deleted");
      fetchProjects();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setEditForm({
      title: project.title,
      description: project.description,
      deadline: project.deadline.split("T")[0],
    });
  };

  const submitEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${editingId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Project updated");
      setEditingId(null);
      fetchProjects();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Projects</h1>

      {projects.length === 0 ? (
        <p className="text-gray-600">You haven't posted any projects yet.</p>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-xl shadow space-y-2"
            >
              {editingId === project._id ? (
                <>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    name="deadline"
                    type="date"
                    value={editForm.deadline}
                    onChange={handleChange}
                    className="p-2 border rounded"
                  />
                  <div className="space-x-2">
                    <button
                      onClick={submitEdit}
                      className="bg-green-500 px-3 py-1 rounded text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 px-3 py-1 rounded text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-800">
                    {project.title}
                  </h2>
                  <p className="text-gray-600">{project.description}</p>
                  <p className="text-sm text-gray-500">
                    Deadline: {project.deadline?.split("T")[0]}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status:{" "}
                    <span className="text-blue-600 font-medium">
                      {project.status || "Open"}
                    </span>
                  </p>
                  <p className="text-sm text-green-600">
                    Bids Received:{" "}
                    {Array.isArray(project.bids) ? project.bids.length : 0}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-2">
                    <a
                      href={`/dashboard/project/${project._id}`}
                      className="bg-blue-600 text-white px-3 py-1 text-sm rounded"
                    >
                      View Details
                    </a>
                    <button
                      onClick={() => startEdit(project)}
                      className="bg-yellow-400 px-3 py-1 text-sm text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="bg-red-500 px-3 py-1 text-sm text-white rounded"
                    >
                      Delete
                    </button>
                  </div>

                  {project.bids?.length > 0 && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-blue-500">
                        View Bids
                      </summary>
                      <ul className="mt-2 pl-4 space-y-1">
                        {project.bids.map((bid, index) => (
                          <li key={index} className="border-b py-1">
                            💬 {bid.message} —{" "}
                            <span className="text-gray-500">
                              Freelancer: {bid.freelancerId?.name || "N/A"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;
