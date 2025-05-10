import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BidForm from "../../components/freelancer/BidForm"; // adjust path if needed

const FreelancerProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to load project");
        }

        const data = await res.json();
        setProject(data.project);
      } catch (err) {
        console.error("Error loading project:", err);
        setError(err.message);
      }
    };

    fetchProject();
  }, [projectId, token]);

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!project) return <div className="p-6">Loading project...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      <p className="mb-2 text-gray-700">{project.description}</p>
      <p className="text-sm text-gray-500">
        Deadline: {new Date(project.deadline).toLocaleDateString()}
      </p>

      <div className="mt-6">
        <BidForm projectId={project._id} />
      </div>
    </div>
  );
};

export default FreelancerProjectDetailPage;
