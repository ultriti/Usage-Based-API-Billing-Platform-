import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL_RD}/api/user/userDetail`, {withCredentials: true});

        setUser(res.data.userDetail); // adjust based on your API response
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src={user?.profilePicture?.url || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-blue-500 mb-4"
          />
          <h2 className="text-xl font-bold">{user?.username}</h2>
          <p className="text-gray-600">{user?.email}</p>

          {/* Email Verification Indicator */}
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-700 mr-2">Email:</span>
            {user?.isVerified?.email ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Verified
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                Not Verified
              </span>
            )}
          </div>

          {/* Phone Verification Indicator */}
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-700 mr-2">Phone:</span>
            {user?.isVerified?.phone ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Verified
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                Not Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
