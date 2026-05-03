// LogoutPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call your backend logout API
      await axios.get("/userLogout", { withCredentials: true });

      navigate("/user/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Logout</h1>
        <p className="text-gray-600 mb-6">
          Are you sure you want to log out of your account?
        </p>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition duration-200"
        >
          Logout
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UserLogout;
