// LoginPage.jsx
import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { UserDataContext } from "../../../context/UserContext";
import { AdminDataContext } from "../../../context/AdminContext";

const UserLogin = () => {
    const { setUserDeatils, loadUserDetail, removeUserDetail } = useContext(UserDataContext);
    const { setAdminDeatils, loadAdminDetail, removeAdminDetail } = useContext(AdminDataContext);


    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const data = {
            email,
            password
        }

        try {


            const res = await axios.post(
                `http://localhost:3000/api/user/userLogin`,
                data,
                { withCredentials: true }
            );

            if (res.status === 200) {
                alert("Login successful!");
                console.log("Response: logon ->", res.data);
                removeAdminDetail();
                // removeUserDetail()

                setUserDeatils(res.data.user);
                navigate("/user/homePage");
            } else {
                console.log("---------->", res.data)
                alert("Login failed: " + res.data.message);
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
                <h1 className="text-3xl font-bold text-center mb-6">MeterFlow</h1>
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

                    {/* <div className="flex justify-between w-[60%] items-center mb-1 text-sm mt-1 text-white">
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
                    </div> */}


                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                    >
                        Sign In
                    </button>
                </form>

                <div className="routeRegisterFrame h-[10vh] w-full flex items-center justify-center">
                    <p className="mt-1 text-gray-300 text-sm cursor-pointer" onClick={() => { navigate("/user/register") }}>Don’t have an account? Register</p>

                </div>

            </div>
        </div>
    );
};



export default UserLogin
