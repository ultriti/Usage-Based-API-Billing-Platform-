import React from 'react'

const AdminSidebar = ({ setActiveSetting, activeSetting }) => {

      const getClassName = (key) => {
    return `${
      activeSetting === key
        ? "text-gray-100  bg-blue-900 hover:cursor-pointer"
        : "bg-gray-800 text-white hover:bg-gray-700"
    }`;
  };

  return (
    <div className='h-full w-full bg-gray-900'>
         <div className="h-[20vh] w-full flex items-center ml-5 font-[700] text-[1.5vw] text-gray-200 border-b-stone-200">
          Dashboard
        </div>


        <ul className="h-full w-full flex flex-col">
          <li
            className=""
            onClick={() => setActiveSetting("transaction")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("transaction")}`}
          >
            Transaction
          </li>
          <li
            className=""
            onClick={() => setActiveSetting("api")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("api")}`}
          >
            api
          </li>
          <li
            className=""
            onClick={() => setActiveSetting("provider")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("provider")}`}
          >
            provider
          </li>
          <li
            className=""
            onClick={() => setActiveSetting("Profile")}
            className={`h-[8vh] w-full flex flex-row items-center pl-2 text-[1.2vw] font-[600] ${getClassName("Profile")}`}
          >
            profile
          </li>
        </ul>

      
    </div>
  )
}

export default AdminSidebar
