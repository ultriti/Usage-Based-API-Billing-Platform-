// ApiDetailFrameTemplate.jsx
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ApiDetailFrameTemplate = () => {
  const location = useLocation();
  const { api } = location?.state || {};
  const [ApiCredentails, setApiCredentails] = useState(null)
  const [userDetailApi, setUserDetailApi] = useState(null);

  const getApiDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/apiGen/getApi/${api?.id}`, { withCredentials: true });

      if (res.status === 200) {
        setUserDetailApi(res.data?.userDetail);

        console.log("----> res.data?.credentailKey < -------------- \n", res.data?.credentailKey)
        setApiCredentails(res.data?.credentailKey);

      } else {
        alert(res.data?.message || "Unexpected response");
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "Request failed");
      } else {
        alert(error.message);
      }
    }
  };

  const getApicredentails = async () => {

    try {

      const apiData = {
        providerApiId: api?.id

      }

      const getApiCredentailsAxios = await axios.post(`http://localhost:3000/api/apiGen/setApi/${api?.id}`, apiData, { withCredentials: true }
      );



      if (getApiCredentailsAxios.status === 200) {
        console.log("----> res.data?.credentailKey < -------------- \n", getApiCredentailsAxios.data?.credentailKey)
        setApiCredentails(getApiCredentailsAxios?.data?.credentailKey);

      } else {
        alert(getApiCredentailsAxios.data?.message || "Unexpected response");
      }

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "Request failed");
      } else {
        alert(error.message);
      }
    }

  }

  useEffect(() => {
    getApiDetail();
  }, []);

  // Copy function
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };


  const CodeBlock = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6 relative">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 font-semibold">{language}</span>
          <button
            onClick={handleCopy}
            className="text-sm px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="text-gray-100 text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    );
  };


  // -----------
  const pythonCode = `
        import requests

        url = "http://localhost:3000/api/apiGen/apiRequest?apiName=${api?.name}"
        params = {
            "name": "${api?.name}"
        }
        headers = {
            "api_provide_key": "YOUR_API_KEY",
            "api_provide_password": "YOUR_API_PASSWORD"
        }

        response = requests.get(url, params=params, headers=headers)
        print(response.json())
        
        `;

  const curlCode = `curl -X GET "http://localhost:3000/api/apiGen/apiRequest?apiName=${api?.name}" \\-H "api_provide_key: YOUR_API_KEY"`;

  const expressCode = `
   const url = "http://localhost:3000/api/apiGen/apiRequest?apiName=${api?.name}";

    const params = {
      name: "${api?.name}"
    };

    const headers = {
      "api_provide_key": "YOUR_API_KEY",
      "api_provide_password": "YOUR_API_PASSWORD"
    };

    const response = await axios.get(url, { params, headers });
    console.log(response.data);
    
    `;



  const reactCode = `

   const url = "http://localhost:3000/api/apiGen/apiRequest?apiName=${api.name}";

    try {
      const response = await axios.get(url, {
        headers: {
          "api_provide_key": "YOUR_API_KEY",
          "api_provide_password": "YOUR_API_PASSWORD"
        },
        withCredentials: true
      });

      console.log(response.data); 
    } catch (error) {
      console.error("Error:", error);
    }
  }

`;

  return (

    <div className="h-[100vh] w-full bg-gray-900 ">

      <div className="userNavbarFrame">

      </div>


      {/* user main frame */}
      <div className="h-full w-full pt-[10vw]">

        <div className="h-[5vh] w-full flex flex-row items-center justify-center">

          {
            console.log("api",api)
          }
          {
            api.status == "active" ? (
              <>
               <span className="h-[1vw] w-[1vw] bg-green-600 rounded-[50%] "></span><p className="ml-5 text-[1.2vw] font-[600] text-gray-400">active</p>
               </>
            ):(
              <>
               <span className="h-[1vw] w-[1vw] bg-red-600 rounded-[50%] "></span><p className="ml-5 text-[1.2vw] font-[600] text-gray-400">revoked</p>
               </>
            )
          } 
        </div>

        <div className="ApiTitleNameFrame h-[15vh] w-full  flex items-center justify-center overflow-hidden">
          <p className="text-[7vw] font-[700] text-gray-300">{api?.name}</p>
        </div>

        <div className="ApiDescNameFrame h-[10vh] w-full  flex items-center justify-center overflow-hidden">
          <p className="text-[2vw] font-[500] text-gray-500">{api?.name}</p>
        </div>


        <div className="ApiButtonFrame h-[30vh] gap-2 w-full flex  flex-row items-center justify-center overflow-hidden">

          {
            console.log("ApiCredentails", ApiCredentails)
          }
          {
            !ApiCredentails ? (
              <>
                <button onClick={() => { getApicredentails() }} className="h-[4vw] w-[25vw] px-5 bg-blue-600 mr-15 hover:bg-blue-700 rounded text-[1.5vw] text-white font-medium cursor-pointer">
                  get api key (per 500 free credits)
                </button>
              </>
            ) : (
              <>

                <input
                  type="text"
                  value={ApiCredentails?.key || "not found"}
                  disabled
                  className="px-3 py-2 w-[20%] rounded bg-gray-800 border border-gray-700 cursor-not-allowed text-gray-300"
                />
                <button
                  onClick={() =>
                    handleCopy(ApiCredentails?.key || "not found")
                  }
                  className="px-4 py-2 bg-blue-600 mr-15 hover:bg-blue-700 rounded text-white font-medium cursor-pointer"
                >
                  Copy
                </button>


                {/*  */}
                <input
                  type="text"
                  value={ApiCredentails?.keyPassword || "not found"}
                  disabled
                  className="px-3 py-2 w-[20%] rounded bg-gray-800 border border-gray-700 cursor-not-allowed text-gray-300"
                />
                <button
                  onClick={() =>
                    handleCopy(ApiCredentails?.keyPassword || "not found")
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium cursor-pointer"
                >
                  Copy
                </button>
              </>
            )
          }


        </div>


        <div className="apiIntergrationFrame h-[100vh] bg-gray-900 w-full pt-5 flex items-center flex-col">
          <p className="text-[2vw] text-gray-300 font-[700]">API Integration</p>

          <div className="integrationProgram mt-5 h-[80vh] w-[90%] bg-gray-700 rounded-lg p-6 overflow-y-auto">
            <CodeBlock language="Python" code={pythonCode} />
            <CodeBlock language="cURL" code={curlCode} />
            <CodeBlock language="expressJs" code={expressCode} />
            <CodeBlock language="react js" code={reactCode} />
          </div>
        </div>






      </div>

    </div >



    //     <div className="min-h-screen bg-gradient-to-b from-purple-700 to-blue-900 flex items-center justify-center">
    //       <div className="h-[100vh] w-[100vw] bg-gray-900 text-gray-100 rounded-lg shadow-lg p-8 space-y-6">
    //         <h1 className="text-3xl font-bold text-center">{api?.name}</h1>
    //         <p className="text-center text-gray-400">{api?.description}</p>

    //         {/* Link */}
    //         <div className="flex items-center space-x-2">
    //           <input
    //             type="text"
    //             value={api?.platformUrl}
    //             disabled
    //             className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 cursor-not-allowed text-gray-300"
    //           />
    //           <button
    //             onClick={() => handleCopy(api?.platformUrl)}
    //             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
    //           >
    //             Copy
    //           </button>
    //         </div>

    //         {/* Key Code */}
    //         <div className="flex items-center space-x-2">

    //             {
    //                 console.log("ApiCredentails ----- \n",ApiCredentails)
    //             }
    //           <input
    //             type="text"
    //             value={ApiCredentails?.key || "not found"}
    //             disabled
    //             className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 cursor-not-allowed text-gray-300"
    //           />
    //           <button
    //             onClick={() =>
    //               handleCopy(ApiCredentails?.key || "not found")
    //             }
    //             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
    //           >
    //             Copy
    //           </button>
    //         </div>

    //         {/* Key Password */}
    //         <div className="flex items-center space-x-2">
    //           <input
    //             type="text"
    //             value={ApiCredentails?.keyPassword || "*kZboe%3OkbU"}
    //             disabled
    //             className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 cursor-not-allowed text-gray-300"
    //           />
    //           <button
    //             onClick={() =>
    //               handleCopy(ApiCredentails?.keyPassword || "*kZboe%3OkbU")
    //             }
    //             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
    //           >
    //             Copy
    //           </button>
    //         </div>

    //         {/* Usage */}
    //         <div className="px-3 py-2 bg-gray-800 rounded border border-gray-700 text-center">
    //           Usage: {api?.usage || 2}
    //         </div>
    //       </div>
    //     </div>







  );
};

export default ApiDetailFrameTemplate;
