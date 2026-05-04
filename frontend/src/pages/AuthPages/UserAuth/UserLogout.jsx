// LogoutPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("/userLogout", { withCredentials: true });

      navigate("/user/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] bg_dark_Theme_70 rounded-2xl">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center bg_dark_Theme_70">
        <h1 className="text-2xl font-bold text-gray-200 mb-4">Logout</h1>
        <p className="text-gray-300 mb-6">
          Are you sure you want to log out of your account?
        </p>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 cursor-pointer text-gray-300 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition duration-200"
        >
          Logout
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 py-2 px-4 bg-gray-500 cursor-pointer hover:bg-gray-400 text-gray-900 font-semibold rounded-md transition duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UserLogout;
