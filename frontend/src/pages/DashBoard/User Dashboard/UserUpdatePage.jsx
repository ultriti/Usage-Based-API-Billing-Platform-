import React, { useState } from "react";
import axios from "axios";

const UserUpdatePage = () => {
  const [formData, setFormData] = useState({
    username: "",
    profileUrl: "",
    ProfileImgId: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("http://localhost:3000/api/user/updateUserDetail", formData,{ withCredentials: true });
      
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Update Profile</h2>
        
        {message && (
          <div className="mb-4 text-center text-sm text-blue-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter new username"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Profile URL</label>
            <input
              type="text"
              name="profileUrl"
              value={formData.profileUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter profile image URL"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Profile Image ID</label>
            <input
              type="text"
              name="ProfileImgId"
              value={formData.ProfileImgId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter profile image ID"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserUpdatePage;
