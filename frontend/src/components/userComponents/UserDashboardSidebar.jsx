import React from "react";
import { NavLink } from "react-router-dom";
import "../providerComponents/ProviderSidebarFrame.css";
import UserProfilePage from "../../pages/DashBoard/User Dashboard/UserProfilePage";

const UserDashboardSidebar = ({ setActiveSetting, activeSetting }) => {
  const getClassName = (key) => {
    return `${
      activeSetting === key
        ? "text-gray-100  bg-blue-900 hover:cursor-pointer"
        : "bg-gray-800 text-white hover:bg-gray-700"
    }`;
  };

  return (
    <div className="ProviderSidebarFrame bg-gray-900">
      <div className="ProviderSidebarCont">
        <div className="h-[20vh] w-full flex items-center ml-5 font-[700] text-[1.5vw] text-gray-200 border-b-stone-200">
          Dashboard
        </div>
        <ul className="h-full w-full flex flex-col">
          <li
            className=""
            onClick={() => setActiveSetting("Profile")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("Profile")}`}
          >
            profile
          </li>

          <li
            className=""
            onClick={() => setActiveSetting("profileEdit")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("profileEdit")}`}
          >
            profile Edit
          </li>

          <li
            className=""
            onClick={() => setActiveSetting("userApiList")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("userApiList")}`}
          >
            Api List
          </li>
          <li
            className=""
            onClick={() => setActiveSetting("UserLogout")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("UserLogout")}`}
          >
            Logout
          </li>

          {/* <NavLink
            to="/user/category/trail"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive ? "bg-blue-900 text-white" : "text-gray-100"
              }`
            }
          >
            trail
          </NavLink> */}

          {/* <NavLink
            to="/user/category/development"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive ? "bg-blue-900 text-white" : "text-gray-100"
              }`
            }
          >
            development
          </NavLink> */}

          {/* <NavLink
            to="/user/category/character"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive ? "bg-blue-900 text-white" : "text-gray-100"
              }`
            }
          >
            character
          </NavLink> */}

          {/* <NavLink
            to="/user/category/documentation"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive ? "bg-blue-900 text-white" : "text-gray-100"
              }`
            }
          >
            documentation
          </NavLink> */}

          {/* <NavLink
            to="/user/category/news"
            className={({ isActive }) =>
              `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-800 ${
                isActive ? "bg-blue-900 text-white" : "text-gray-100"
              }`
            }
          >
            news api's
          </NavLink> */}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboardSidebar;
