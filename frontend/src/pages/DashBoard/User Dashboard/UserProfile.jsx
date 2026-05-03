import React from "react";

const UserProfile = ({ setActiveSetting, activeSetting}) => {

    const serialized = localStorage.getItem('userDeatils');
    const user = serialized ? JSON.parse(serialized) : null;

  return (
    <div className="h-full w-full">
      <div className="flex flex-col items-center">
        {/* Profile Picture */}
        <img
          src={user?.profilePicture?.url || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-28 h-28 rounded-full border-4 border-blue-500 mb-4"
        />

        {/* Username */}
        <h2 className="text-2xl font-bold">{user?.username}</h2>

        {/* Email + Verification */}
        <div className="flex items-center mt-2">
          <label className="text-sm text-gray-300 mr-2">Email:</label>
          <span className="text-gray-100">{user?.email}</span>
          {user?.isVerified?.email ? (
            <span className="ml-2 px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">
              Verified
            </span>
          ) : (
            <span className="ml-2 px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">
              Not Verified
            </span>
          )}
        </div>

        {/* Phone + Verification */}
        <div className="flex items-center mt-2">
          <label className="text-sm text-gray-300 mr-2">Phone:</label>
          <span className="text-gray-100">{user?.phoneNumber || "N/A"}</span>
          {user?.isVerified?.phone ? (
            <span className="ml-2 px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">
              Verified
            </span>
          ) : (
            <span className="ml-2 px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">
              Not Verified
            </span>
          )}
        </div>

        {/* Role */}
        <div className="flex items-center mt-2">
          <label className="text-sm text-gray-300 mr-2">Role:</label>
          <span className="text-gray-100">{user?.role}</span>
        </div>

        {/* Subscription Plan */}
        <div className="flex items-center mt-2">
          <label className="text-sm text-gray-300 mr-2">Subscription:</label>
          <span className="text-gray-100">{user?.subscriptionPlan}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
