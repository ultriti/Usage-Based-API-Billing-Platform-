// LoginPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
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
                navigate("/user/HomePage");
            } else {
                console.log("---------->",res.data)
                alert("Login failed: " + res.data.message);
            }
        } catch (err) {
            console.error("Error logging in:", err);
            alert("Something went wrong!");
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};



export default UserLogin
