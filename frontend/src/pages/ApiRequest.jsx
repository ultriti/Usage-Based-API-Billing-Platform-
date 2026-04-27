import axios from 'axios';
import React, { useEffect, useState } from 'react'

const ApiRequest = () => {

  const [data, setdata] = useState(null)

  const demo = async () => {
    //   const url = "http://localhost:3000/api/apiGen/apiRequest?apiName=poke";

    //   try {
    //     const response = await axios.get(url, {
    //       headers: {
    //         "api_provide_key": "upNXcKOLOws3mFdur]npnnd,2",
    //         "api_provide_password": "ohjcc@Czl|!}"
    //       },
    //       withCredentials: true

    //     });

    //     console.log(response.data);
    //     setdata(response.data)


    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // }






    const url = "http://localhost:3000/api/apiGen/apiRequest?apiName=todo list api";

    try {
      const response = await axios.get(url, {
        headers: {
          "api_provide_key": "gVV#FDSV5j1jQpZiYZPMdijoN",
          "api_provide_password": "rvW*3P!>86AA"
        },
        withCredentials: true
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  }







  useEffect(() => {
    demo()
  }, [])


  return (
    <div>
      {
        data ? (
          <>
            {
              data.data.count
              // .results.map((data,i)=>(
              //   <>
              //   {
              //     data
              //   }
              //   </>
              // ))
            }
          </>
        ) : (
          <></>
        )
      }

    </div>
  )
}

export default ApiRequest
