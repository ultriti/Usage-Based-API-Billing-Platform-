import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CircularLoading_1 from "../../../components/CircularLoading_1";

const AdminRegister = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setisLoading(true);
    const data = {
      username,
      email,
      password,
      adminToken,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/admin/createAdmin`,
        data,
        { withCredentials: true },
      );

      if (res.status === 201) {
        alert("Admin registered successfully!");
        console.log("Response: admin register ->", res.data);
        navigate("/admin/12UHJI342BEHNDINER88496/Dashboard");
        setisLoading(false);
      } else {
        alert("Registration failed: " + res.data.message);
        setisLoading(false);
      }
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.data);
        alert("Registration failed: " + err.response.data.message);
        setisLoading(false);
      } else {
        console.error("Error registering:", err);
        alert("Something went wrong!");
        setisLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-700 to-blue-900">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">MeterFlow Admin</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Admin Token
            </label>
            <input
              type="text"
              name="adminToken"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your admin token"
              required
            />
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
            onClick={() => {
              navigate("/admin/12UHJI342BEHNDINER88496/login");
            }}
          >
            Already have an account? Sign In
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
