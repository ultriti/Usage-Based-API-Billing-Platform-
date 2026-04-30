import React from "react";
import { NavLink } from "react-router-dom";
import "../providerComponents/ProviderSidebarFrame.css";

const UserSidebar = () => {
  return (
    <div className="ProviderSidebarFrame bg-gray-900">
      <div className="ProviderSidebarCont">
        <div className="h-[20vh] w-full flex items-center ml-5 font-[700] text-[1.5vw] text-gray-200 border-b-stone-200">
          Categories
        </div>
        <ul className="h-full w-full flex flex-col">
          <NavLink
            to="/user/HomePage"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-100"
              }`
            }
          >
            all
          </NavLink>
          <NavLink
            to="/user/category/trail"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-100"
              }`
            }
          >
            trail
          </NavLink>

          <NavLink
            to="/user/category/development"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-100"
              }`
            }
          >
            development
          </NavLink>

          <NavLink
            to="/user/category/character"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-100"
              }`
            }
          >
            character
          </NavLink>


          <NavLink
            to="/user/category/documentation"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-100"
              }`
            }
          >
            documentation
          </NavLink>

          <NavLink
            to="/user/category/news"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive
                  ? "bg-blue-900 text-white"
                  : "text-gray-100"
              }`
            }
          >
            news api's
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default UserSidebar;
