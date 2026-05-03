import React, { useState } from "react";
import axios from "axios";

const UserProfileEdit = () => {
  const [formData, setFormData] = useState({
    username: "",
    profileUrl: "",
    ProfileImgId: "",
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
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/user/userUpdate`,
        formData,
        { withCredentials: true } // ensures cookies/JWT are sent
      );
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full ">
      <div className="shadow-lg rounded-lg p-8 w-full max-w-md text-white">
        <h2 className="text-2xl font-bold text-center mb-6">Edit Profile</h2>

        {message && (
          <div className="mb-4 text-center text-sm text-blue-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter new username"
            />
          </div>

          {/* Profile URL */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Profile Image URL
            </label>
            <input
              type="text"
              name="profileUrl"
              value={formData.profileUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter profile image URL"
            />
          </div>

          {/* Profile Image ID */}
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Profile Image ID
            </label>
            <input
              type="text"
              name="ProfileImgId"
              value={formData.ProfileImgId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter profile image ID"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileEdit;
