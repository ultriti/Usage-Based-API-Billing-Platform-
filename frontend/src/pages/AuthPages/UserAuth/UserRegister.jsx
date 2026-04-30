// UserRegister.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        // `import.meta.env.BACKEND_URL_RD/api/user/userRegister`,
        `https://usage-based-api-billing-platform.onrender.com/api/user/userRegister`,
        formData,
        { withCredentials: true },
      );

      if (res.status === 201) {
        alert("Registration successful!");
        navigate("/user/HomePage");
        console.log(res.data);
      } else {
        alert(res.data.message || "Registration failed");
      }
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.data);
        alert("Login failed: " + err.response.data.message);
      } else {
        console.error("Error logging in:", err);
        alert("Something went wrong!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-700 to-blue-900">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6">MeterFlow</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
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
              placeholder="Enter email"
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
              placeholder="Enter password"
              required
            />
          </div>

          <div className="routeRegisterFrame h-[5vh] w-full flex items-center justify-end">
            <p
              className="mt-1 text-blue-500 text-sm cursor-pointer"
              onClick={() => {
                navigate("/user/login");
              }}
            >
              Forgot your password ?
            </p>
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="provider">Provider</option>
            </select>
          </div> */}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            Register
          </button>
        </form>

        <div className="routeRegisterFrame h-[10vh] w-full flex items-center justify-center">
          <p
            className="mt-1 text-gray-300 text-sm cursor-pointer"
            onClick={() => {
              navigate("/user/login");
            }}
          >
            Alredy have an account ? sign in
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
