import React from 'react'
import { NavLink } from "react-router-dom";
import "./providerComponents/ProviderSidebarFrame.css";

const UserSidebar = () => {
    return (
        <div className="ProviderSidebarFrame bg-gray-900">
            <div className="ProviderSidebarCont">
                <div className='h-[20vh] w-full flex items-center ml-5 font-[700] text-[1.5vw] text-gray-200 border-b-stone-200'>
                    Categories
                </div>
                <ul className="h-full w-full flex flex-col">
                    <NavLink
                        to="/user/HomePage"
                        className={({ isActive }) =>
                            `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
                            }`
                        }
                    >
                        trail
                    </NavLink>

                    <NavLink
                        to="/user/HomePage"
                        className={({ isActive }) =>
                            `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
                            }`
                        }
                    >
                        development

                    </NavLink>

                    <NavLink
                        to="/user/HomePage"
                        className={({ isActive }) =>
                            `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
                            }`
                        }
                    >
                        billing api's
                    </NavLink>

                    <NavLink
                        to="/user/HomePage"
                        className={({ isActive }) =>
                            `h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] hover:cursor-pointer hover:bg-gray-900 ${isActive ? "bg-blue-900 text-white" : "bg-gray-800 text-gray-100"
                            }`
                        }
                    >
                        news api's
                    </NavLink>
                </ul>
            </div>
        </div>
    )
}

export default UserSidebar
