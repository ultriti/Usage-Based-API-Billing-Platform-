import React, { useEffect, useState } from 'react'
import ApiTemplateFrame from './ApiTemplateFrame'
import axios from 'axios';

const UserHomePage = () => {

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
    <div className='userHomePageFrame h-[100vh] w-[100vw] bg-gray-700'>

      <div className="userNavbarFrame">

      </div>

      <div className="UserMainFrame">


        <div className="apiTemplateFrame h-[28vh] w-[30vw] bg-gray-600">

          {
            allApis ? (

              allApis?.map((api, i) => (
                <>
                  <ApiTemplateFrame

                    name={api?.name}
                    link={api?.platformUrl}
                    description={api?.description}

                  />
                </>

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
