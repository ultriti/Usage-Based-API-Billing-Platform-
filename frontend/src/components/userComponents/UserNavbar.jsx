import React from 'react'
import { NavLink } from 'react-router-dom'

const UserNavbar = () => {
    return (
        <div className='h-[4vw] w-[100vw]fixed'>

            <div className="navbarFrameCont h-[100%] w-[100%] flex flex-row justify-between items-center">

                <div className="logoFrame flex items-center justify-center h-[100%] w-[15vw] ml-10 text-[2vw] font-[800] text-gray-200">
                    <p>MeterFlow</p>
                </div>

                <div className="navRouteLink h-full w-[45vw] mr-10 text-gray-300">

                    <ul className='h-full w-[100%] flex flex-row gap-10 items-center justify-end pr-5 pl-5 text-[1.5vw] capitalize font-[600]'>
                        <NavLink to={"/user/HomePage"} className='cursor-pointer'>home</NavLink>
                        <li className='cursor-pointer'>api</li>
                        <li className='cursor-pointer'>profile</li>
                    </ul>

                </div>

            </div>

        </div>
    )
}

export default UserNavbar
