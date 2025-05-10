import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProjectForm = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Project title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.requirements.trim()) newErrors.requirements = 'Requirements are required';
    if (!form.deadline) newErrors.deadline = 'Deadline is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!validate()) return;

    try {
      const { data } = await axios.post('http://localhost:5000/api/projects', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Project created successfully!');
      setForm({ title: '', description: '', requirements: '', deadline: '' });
      setErrors({});
    } catch (error) {
      toast.error('Error creating project');
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 py-6 space-y-4 max-w-xl mx-auto mt-10"
    >
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Post a New Project</h2>

      <div>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Project Title"
          className={`w-full border p-3 rounded ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Project Description"
          className={`w-full border p-3 rounded ${errors.description ? 'border-red-500' : ''}`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div>
        <textarea
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          placeholder="Skills / Requirements"
          className={`w-full border p-3 rounded ${errors.requirements ? 'border-red-500' : ''}`}
        />
        {errors.requirements && (
          <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>
        )}
      </div>

      <div>
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className={`w-full border p-3 rounded ${errors.deadline ? 'border-red-500' : ''}`}
        />
        {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Submit Project
      </button>
    </form>
  );
};

export default ProjectForm;
