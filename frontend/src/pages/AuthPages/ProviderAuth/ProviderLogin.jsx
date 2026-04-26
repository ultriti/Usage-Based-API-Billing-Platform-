import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProviderLogin.css"

import { AdminDataContext } from "../../../context/AdminContext";

const ProviderLogin = () => {
  const {  setAdminDeatils, loadAdminDetail, removeAdminDetail  } = useContext(AdminDataContext);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/provider/providerLogin",
        formData,
        { withCredentials: true }
      );

      if (res.status === 200) {
        alert("Login successful!");
        console.log("Response: logon ->", res.data);
        setAdminDeatils(res.data.providerDetail);
        navigate("/provider/Dashboard");
      } else {
        alert("Login failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="userLoginFrame flex items-center justify-center h-screen bg-gray-100">

      <div className="userLoginFrameCont flex w-4/5 h-4/5   flex flex-row shadow-lg rounded-2xl overflow-hidden">

        {/* Left side - Login form */}
        <div className="flex-1 flex flex-col justify-center gap-1 items-center w=[50%] h-[100%] p-10">
          <h2 className="text-2xl font-bold text-white">Login</h2>
          <form className="flex flex-col h-[50vh] w-full gap-3 justify-center items-center" onSubmit={handleSubmit}>
            <label className="mb-2 text-gray-50">Username or Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="p-3 mb-4 border h-10 w-[60%] mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="mb-2 text-gray-50">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="p-3 mb-4 border h-10 w-[60%] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-between w-[60%] items-center mb-1 text-sm mt-1 text-white">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="mr-2"
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="bg-blue-600 h-10 w-[60%] mt-1 text-white py-3 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
          <p className="mt-1 text-gray-300 text-sm cursor-pointer" onClick={()=>{navigate("/provider/register")}}>Don’t have an account?</p>
        </div>

        {/* Right side - Illustration/info */}
        <div className="flex-1 flex flex-col justify-center h-full w-1/2 items-center bg-blue-500 relative" >

          <img src="https://thf.bing.com/th/id/OIP.z_LRhuaZZLcekDExDPuDfgHaEK?w=310&h=180&c=7&r=0&o=7&cb=thfc1&dpr=1.5&pid=1.7&rm=3" alt="" className="h-[100%] w-[100%] object-cover relative" />
          <div className="leftCont h-[100%] w-[90%] flex-1 flex flex-col justify-end absolute p-10">


            <h3 className="text-xl font-semibold mb-1 text-white mt-5">Check Your Project Progress</h3>
            <p className="text-gray-100 mb-6 ">
              Lorem ipsum dolor sit amet tristique ullamcorper sed pellentesque
              dolor, semper et amet ipsum.
            </p>
            <div className="text-6xl text-center mb-5 ">📊📈📉</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
