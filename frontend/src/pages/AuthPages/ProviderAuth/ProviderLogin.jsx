// ProviderLogin.jsx
import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { UserDataContext } from "../../../context/UserContext";
import { AdminDataContext } from "../../../context/AdminContext";
import CircularLoading_1 from "../../../components/CircularLoading_1";

const ProviderLogin = () => {
  const { setUserDeatils, removeUserDetail } = useContext(UserDataContext);
  const { setAdminDeatils, removeAdminDetail } = useContext(AdminDataContext);
  const [isLoading, setisLoading] = useState(false);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setisLoading(true);

    const data = { email, password };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/provider/providerLogin`,
        data,
        { withCredentials: true },
      );

      if (res.status === 200) {
        alert("Login successful!");
        console.log("Response: logon ->", res.data);
        removeUserDetail();
        removeAdminDetail();
        setAdminDeatils(res.data.providerDetail);
        navigate("/provider/dashboard");
        setisLoading(false);
      } else {
        setisLoading(false);
        alert("Login failed: " + res.data.message);
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
          MeterFlow Provider
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
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

          {isLoading ? (
            // isLoading ? (
            <>
              <CircularLoading_1 />
            </>
          ) : (
            <>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </form>
        {/* {isLoading ? <></> : <></>}
        <button
          type="button"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold cursor-pointer"
        >
          Sign In
        </button> */}

        <div className="routeRegisterFrame h-[10vh] w-full flex items-center justify-center">
          <p
            className="mt-1 text-gray-300 text-sm cursor-pointer"
            onClick={() => navigate("/provider/register")}
          >
            Don’t have an account? Register
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
