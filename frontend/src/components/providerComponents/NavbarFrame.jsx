import React from 'react'
import { NavLink } from 'react-router-dom'

const NavbarFrame = () => {
    return (
        <div className='h-[4vw] w-[100vw]fixed'>

            <div className="navbarFrameCont h-[100%] w-[100%] flex flex-row justify-between items-center">

                <div className="logoFrame h-[100%] w-[15vw] ml-10 ">

                </div>

                <div className="navRouteLink h-full w-[45vw] mr-10 text-gray-300">

                    <ul className='h-full w-[100%] flex flex-row gap-10 items-center justify-end pr-5 pl-5 text-[1.5vw] capitalize font-[600]'>
                        <li className='cursor-pointer'>home</li>
                        <li className='cursor-pointer'>api</li>
                        <li className='cursor-pointer'>profile</li>
                    </ul>

                </div>

            </div>

        </div>
    )
}

export default NavbarFrame
