import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserApiUsingFrame = ({ setActiveSetting, activeSetting }) => {
  const navigate = useNavigate()
  const [allapi, setapi] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const serialized = localStorage.getItem("userDeatils");
  const userDeatils = serialized ? JSON.parse(serialized) : null;

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/user/getUserUsingApis`,
        { withCredentials: true },
      );

      console.log("----------->\n", res.data.apis);
      setapi(res.data.apis); // adjust based on your API response
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching user data");
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  };

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!allapi) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    // <div className="bg-gray-800 h-[93vh] w-full p-[2vw] mt-[4vw] flex items-center justify-center ml-[12vw]">
    <div className="userProfilePage_Sub_Frame h-full w-[96%] bg-gray-900 ml-[3vw] rounded-[10px] overflow-y-auto p-6 text-white">
      {/* User Header */}
      <div className="flex items-center mb-6">
        <img
          src={userDeatils.profilePicture?.url || ""}
          alt="Profile"
          className="w-16 h-16 rounded-full border-2 border-blue-500 mr-4"
        />
        <div>
          <h2 className="text-xl font-bold">{userDeatils.username}</h2>
          <p className="text-gray-400">{userDeatils.email}</p>
          <p className="text-sm text-gray-400">Role: {userDeatils.role}</p>
          <p className="text-sm text-gray-400">
            Subscription: {userDeatils.subscriptionPlan}
          </p>
        </div>
      </div>

      {/* API List */}
      <h3 className="text-lg font-semibold mb-4 z-500">Your APIs</h3>
      {allapi ? (
        allapi.map((api) => (
          // <div
          //   key={api._id}
          //   className="bg-gray-700 rounded-lg p-4 mb-4 shadow-md"
          // >
          //   <p className="text-sm text-gray-300 mb-2">
          //     Request Type:{" "}
          //     <span className="font-semibold text-blue-300">
          //       {api.Subscription?.type}
          //     </span>
          //   </p>

          //   <div className="flex items-center justify-between mb-2">
          //     <span className="text-sm text-gray-300">API URL:</span>
          //     <button
          //       onClick={() => handleCopy(api.url)}
          //       className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
          //     >
          //       Copy
          //     </button>
          //   </div>
          //   <p className="text-gray-100 break-all">{api.url}</p>

          //   <div className="flex items-center justify-between mt-3">
          //     <span className="text-sm text-gray-300">Key Code:</span>
          //     <button
          //       onClick={() => handleCopy(api.keyCode)}
          //       className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
          //     >
          //       Copy
          //     </button>
          //   </div>
          //   <p className="text-gray-100 break-all">{api.keyCode}</p>

          //   {copied === api.url && (
          //     <p className="text-green-400 text-xs mt-1">URL copied!</p>
          //   )}
          //   {copied === api.keyCode && (
          //     <p className="text-green-400 text-xs mt-1">Key copied!</p>
          //   )}
          // </div>
          <>
            <div
              onClick={() => {
                navigate("/user/apiDetailFrame", {
                  state: {
                    api: {
                      id: api?.fullApiDoc?._id,
                      name: api?.fullApiDoc?.name,
                      platformUrl: api?.fullApiDoc?.platformUrl,
                      description: api?.fullApiDoc?.description,
                      keyCode: api?.keyCode,
                      status: api?.fullApiDoc?.status,
                      usage: 2,
                    },
                  },
                });
              }}
              key={api._id}
              className="bg-gray-700 rounded-lg p-4 mb-4 shadow-md flex items-center justify-between mb-5 z-500"
            >
              {/* Left side: API icon + name */}
              <div className="flex items-center space-x-3 z-500">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full text-white font-bold">
                  API
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {api.fullApiDoc.name || "Unnamed API"}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {api?.Subscription?.type || "Unknown type"}
                  </p>
                </div>
              </div>

              {/* Center: Requests + Billing */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-300">
                  {api?.Subscription?.requests} requests
                </p>
                {/* <p className="text-sm text-gray-300">${api.apiBill}</p> */}
              </div>

              {/* Right side: Toggle */}
              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={true} // or api.active if you track status
                  />
                  {api.partialPayment ? (
                    <>
                      <div className="px-8 py-1 bg-gray-500 rounded-full border border-green-700 relative transition flex items-center justify-center text-gray-100">
                        <p className="font-[600]">paid</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="m-w-11 h-8 px-3 py-2 z-500 bg-gray-500 rounded-full bg-gray-300 border border-red-600 relative transition flex items-center justify-center text-red-700">
                        <p>unpaid</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>
          </>
        ))
      ) : (
        <p className="text-gray-400">No APIs found.</p>
      )}
      {/* </div> */}
    </div>
  );
};

export default UserApiUsingFrame;
