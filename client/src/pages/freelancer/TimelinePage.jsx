import { useEffect, useState } from 'react';

const TimelinePage = () => {
  const [projects, setProjects] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/freelancers/my-projects', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setProjects(data.projects || []);
    };
    fetchProjects();
  }, [user.token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Project Timelines</h2>
      {projects.map((p) => (
        <div key={p._id} className="border p-4 mb-4 bg-white shadow rounded">
          <h3 className="font-semibold">{p.title}</h3>
          <p>Status: {p.status}</p>
          <div className="w-full bg-gray-200 rounded h-3 my-2">
            <div className="bg-blue-500 h-3 rounded" style={{ width: `${p.progress || 0}%` }} />
          </div>
          <p>Progress: {p.progress || 0}%</p>
        </div>
      ))}
    </div>
  );
};

export default TimelinePage;
