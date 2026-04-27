import React, { useEffect, useState } from 'react'
import ApiTemplateFrame from './ApiTemplateFrame'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import SearchBarHPUser from '../../components/SearchBarHPUser';
import UserNavbar from '../../components/UserNavbar';
import UserSidebar from '../../components/UserSidebar';


const UserHomePage = () => {
  const navigate = useNavigate()

  const [allApis, getallApis] = useState([])


  const getAllApis = async (req, res) => {


    try {
      const getAllApisAxios = await axios.get(
        `http://localhost:3000/api/apiGen/getAllApi`,
        { withCredentials: true }
      );

      console.log(getAllApisAxios.data);

      if (getAllApisAxios.status === 200) {
        // alert("All APIs fetched successfully");
        console.log("---apis:", getAllApisAxios.data.allApi)
        getallApis(getAllApisAxios.data.allApi); // update state/context
      } else {
        alert(getAllApisAxios.data.message || "Unexpected response");
      }
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        alert(error.response.data.message || "Request failed");
      } else {
        console.error("Network error:", error);
        alert(error.message);
      }
    }
  }


  useEffect(() => {
    getAllApis()
  }, [])




  return (
    <div className='userHomePageFrame w-[99.2vw] bg-gray-700'>

      <div className="userNavbarFrame">
        <UserNavbar/>
      </div>

      <div className="userSidebarFrame">
        <UserSidebar/>
      </div>

      <div className="UserMainFrame bg-gray-800">


        <div className="UserHomePageFrameCont h-[50vh] w-[100%]  flex flex-col items-center justify-center px-15 gap-4">
          <p className='text-[3vw] font-[700] text-gray-200'>MeterFlow – An API Dashboard </p>
          <p className='text-[1.3vw] font-[500] text-gray-300'>Welcome to your personal API dashboard. Here you can view your active API keys, track request usage in real time, monitor billing, and manage your subscription plan. Stay on top of your API activity with clear analytics and secure access.</p>
        </div>

        <p className='text-[2vw] font-[700] text-gray-300 self-center'>All Api's</p>


        <div className="ApiSearchBarFrame h-[20vh] w-[100%]  flex flex-row items-center justify-center">
          <SearchBarHPUser />
        </div>


        <div className="apiTemplateFrame h-[100%] w-[100%] py-5 flex gap-5 flex-wrap">


          {
            allApis ? (

              allApis?.map((api, i) => (
                <div onClick={() => {
                  navigate("/user/apiDetailFrame", {
                    state: {
                      api: {
                        id: api?._id,
                        name: api?.name,
                        platformUrl: api?.platformUrl,
                        description: api?.description,
                        keyCode: api?.key,
                        status: api?.status,
                        usage: 2,
                      },
                    },
                  })
                }}
                >


                  <ApiTemplateFrame

                    name={api?.name}
                    link={api?.platformUrl}
                    description={api?.description}

                  />
                </div>

              ))
            ) : (
              <>
              </>
            )
          }

        </div>

      </div>

    </div>
  )
}

export default UserHomePage
