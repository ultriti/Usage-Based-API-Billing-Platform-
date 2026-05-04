// ProviderRegister.jsx
import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { UserDataContext } from "../../../context/UserContext";
import { AdminDataContext } from "../../../context/AdminContext";
import CircularLoading_1 from "../../../components/CircularLoading_1";

const ProviderRegister = () => {
  const navigate = useNavigate();

  const { setUserDeatils, removeUserDetail } = useContext(UserDataContext);
  const { setAdminDeatils, removeAdminDetail } = useContext(AdminDataContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "provider",
  });
  const [isLoading, setisLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setisLoading(true);
    try {
      console.log("import.meta.env", import.meta.env);
      console.log(
        "import.meta.env.VITE_BACKEND_URL_RD",
        import.meta.env.VITE_BACKEND_URL_RD,
      );
      // alert(`${import.meta.env}`);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/provider/providerRegister`,
        formData,
        { withCredentials: true },
      );

      if (res.status === 201) {
        alert("Provider registered successfully!");
        console.log("Response:", res.data);
        removeUserDetail();
        removeAdminDetail();
        setAdminDeatils(res.data.Provider);
        navigate("/provider/dashboard");
        setisLoading(false);
      } else {
        alert("Error: " + res.data.message);
        setisLoading(false);
      }
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.data);
        alert("Login failed: " + err.response.data.message);
        setisLoading(false);
      } else {
        console.error("Error logging in:", err);
        alert("Something went wrong!");
        setisLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-700 to-blue-900">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Provider Register
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="provider">Provider</option>
            </select>
          </div>

          {isLoading ? (
            <>
              <CircularLoading_1 />
            </>
          ) : (
            <>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold cursor-pointer"
              >
                Register
              </button>
            </>
          )}
        </form>

        <div className="routeLoginFrame h-[10vh] w-full flex items-center justify-center">
          <p
            className="mt-1 text-gray-300 text-sm cursor-pointer"
            onClick={() => navigate("/provider/login")}
          >
            Already have an account? Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
