import React from "react";
import { NavLink } from "react-router-dom";
import "./ProviderSidebarFrame.css";

const ProviderSidebarFrame = () => {
  return (
    <div className="ProviderSidebarFrame">
      <div className="ProviderSidebarCont">
        <ul className="h-full w-full flex flex-col">
          <NavLink
            to="/provider/dashboard"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-400 ${
                isActive ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-100"
              }`
            }
          >
            DashBoard
          </NavLink>

          <NavLink
            to="/provider/apis"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-400 ${
                isActive ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-100"
              }`
            }
          >
            APIs
          </NavLink>

          <NavLink
            to="/provider/billing"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-400 ${
                isActive ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-100"
              }`
            }
          >
            billing
          </NavLink>

          <NavLink
            to="/provider/profile"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-400 ${
                isActive ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-100"
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
