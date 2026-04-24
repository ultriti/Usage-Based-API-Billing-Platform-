import React from "react";
import { NavLink } from "react-router-dom";
import "./ProviderSidebarFrame.css";

const ProviderSidebarFrame = () => {
  return (
    <div className="ProviderSidebarFrame bg-gray-900">
      <div className="ProviderSidebarCont">
        <ul className="h-full w-full flex flex-col">
          <NavLink
            to="/provider/dashboard"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${
                isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
              }`
            }
          >
            DashBoard
          </NavLink>

          <NavLink
            to="/provider/providerApi"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${
                isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
              }`
            }
          >
            APIs
          </NavLink>

          <NavLink
            to="/provider/billing"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${
                isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
              }`
            }
          >
            billing
          </NavLink>

          <NavLink
            to="/provider/profile"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${
                isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
              }`
            }
          >
            Profile
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default ProviderSidebarFrame;
