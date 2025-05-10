import { useState } from "react";

const EditProfileSection = ({ freelancer, token, onUpdate }) => {
  const [formData, setFormData] = useState({
    skills: freelancer.skills.join(", "),
    experience: freelancer.experience,
    portfolio: freelancer.portfolio,
    expertise: freelancer.expertise,
  });

  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/freelancers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map((s) => s.trim()),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Profile updated!");
        if (onUpdate) onUpdate(); // ⬅️ Refresh freelancer data
      } else {
        setSuccess("❌ Update failed.");
      }
    } catch (err) {
      console.error(err);
      setSuccess("❌ Update failed.");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-2">Edit Profile</h2>
      <input
        type="text"
        name="skills"
        placeholder="Skills (comma separated)"
        value={formData.skills}
        onChange={handleChange}
        className="w-full border p-2 mb-2"
      />
      <input
        type="text"
        name="expertise"
        placeholder="Expertise"
        value={formData.expertise}
        onChange={handleChange}
        className="w-full border p-2 mb-2"
      />
      <textarea
        name="experience"
        rows="3"
        placeholder="Experience"
        value={formData.experience}
        onChange={handleChange}
        className="w-full border p-2 mb-2"
      />
      <input
        type="text"
        name="portfolio"
        placeholder="Portfolio URL"
        value={formData.portfolio}
        onChange={handleChange}
        className="w-full border p-2 mb-2"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
      {success && <p className="mt-2 text-green-600">{success}</p>}
    </div>
  );
};

export default EditProfileSection;
