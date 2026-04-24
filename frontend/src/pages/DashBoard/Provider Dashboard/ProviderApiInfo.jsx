import axios from "axios";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import copyCodePng from "../../../../public/icon/copyCode.webp"
import apiPng from "../../../../public/icon/10329422.png"
import { fetchProviderApis } from './GetProviderApis';


const ProviderApiInfo = ({ logo, name, requests, id, active, chartData, baseUrl, revenue, fetchData }) => {
  const [status_, setstatus_] = useState(active)

  const apiStatusUpdate = async (apiId, status) => {
    console.log("status:::", status)

    try {
      const toggleStatus = await axios.put(`http://localhost:3000/api/apiGen/updateApiStatus/${id}`, { status }, { withCredentials: true });

      if (toggleStatus.status == 201) {
        console.log("toggleStatus.data.message", toggleStatus.data.message)
        console.log(toggleStatus.data.status == "active" ? true : false)
        setstatus_(toggleStatus.data.status)
      } else {
        alert(`${toggleStatus.data.message}`)

      }
    } catch (error) {
      console.log(error.message);

    }

  }

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      console.log("Copied:", url);
      alert("Copied to clipboard!");
    });
  };


  const getProviderApiFuntion = async () => {
    const data = await fetchProviderApis();
    console.log("providerApis", data)
    setproviderApis(data.providerApi);
  }


  // use effects 
  useEffect(() => {
    // fetching api here ---
    getProviderApiFuntion()
    // const interval = setInterval(fetchData, 5000);
    // return () => clearInterval(interval);
  }, []);


  return (
    <div className="apisListInfo h-[12vh] w-full bg-gray-600 rounded-2xl flex items-center px-6 shadow-md" onClick={() => { fetchData(id) }}>

      {/* Logo + Name */}
      <div className="flex flex-row w-[30vw] h-full items-center space-x-4 overflow-hidden">
        <img src={apiPng} alt={name} className="w-12 h-12 rounded-full bg-gray-200 p-1" />
        <p className="text-white font-semibold text-[1.5vw]">{name}</p>
      </div>

      {/* Requests */}

      <div className="RequestFrame w-[15vw] h-full flex flex-row items-center justify-center overflow-hidden">

        <p className="text-gray-200 text-[1.2vw] font-[600] pl-4 pr-2">{requests.toLocaleString()} requests</p>

      </div>


      {/* Mini Graph */}
      <div className="w-32 h-12 w-[20vw] flex flex-row items-center justify-center ">
        {/* <Line
          data={chartData.data}
          options={{
            ...chartData.options,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
          }}
        /> */}
        <p className="text-[1.2vw] font-[600]">$ {revenue}</p>
      </div>

      <div className="apiUrlCopyFrame h-[5vw] w-[5vw] py-5 px-5 ">
        <img onClick={() => { handleCopy(baseUrl) }} className="h-full w-full px-1 rounded-2xl bg-gray-200 cursor-pointer" src={copyCodePng} alt="" />
      </div>

      {/* Toggle */}
      <label className="inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={(active == "active" ? true : false)}
          onClick={() => apiStatusUpdate(id, status_)}
        />

        {
          // toggleActive ? (
          (status_ == "active" ? true : false) ? (
            <>
              <div className="w-11 h-6 bg-green-500 flex items-center rounded-full peer peer-checked:bg-green-500 relative transition">
                <div className="absolute  right-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </div>
            </>
          ) : (
            <>
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gray-500 relative transition">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
              </div>
            </>
          )
        }

      </label>


    </div>
  );
};

export default ProviderApiInfo;
