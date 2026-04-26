import React, { useEffect, useState } from 'react'
import "./providerApiFrame.css"
import NavbarFrame from '../../../../components/NavbarFrame'
import "./providerApiFrame.css"
import ProviderSidebarFrame from '../../../../components/providerComponents/ProviderSidebarFrame'
import axios from 'axios'
import CreateApiForm from './CreatApiForm'
import { Line } from "react-chartjs-2";
import { fetchProviderApis } from '../GetProviderApis';

import { getGraphData } from "../../Graph";
import ProviderApiDetaiFrame from './ProviderApiDetaiFrame'

const ProviderApiFrame = () => {

    const [formData, setFormData] = useState({
        // providerId: "",
        baseUrl: "",
        name: "",
    });
    const [ToggleCreatApiFrom, setToggleCreatApiFrom] = useState(false)
    const [chartData, setChartData] = useState(null);
    const [providerApis, setproviderApis] = useState([])
    const [toggleCreateFrame, settoggleCreateFrame] = useState(false)



    const fetchData = async () => {
        try {
            const res = await axios.post("http://localhost:3000/api/apiGen/getProviderInfo", {}, { withCredentials: true });
            const formatted = getGraphData(res.data);
            setChartData(formatted);

            const data = await fetchProviderApis();
            console.log("providerApis", data);
            setproviderApis(data.providerApi);

        } catch (err) {
            console.error("Error fetching graph data:", err);
        }
    };


    useEffect(() => {
        fetchData()
    }, [])



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


    const toggleCreateApiFrameFun = (value) => {
        setToggleCreatApiFrom(value);
    }

    return (
        <div className='providerApiFrame'>


            {/* create api  form */}
            {
                ToggleCreatApiFrom ? (
                    <div className='toggleCreateFrame h-[100%] w-[100%] z-900 flex items-center justify-center bg-gray-900 fixed top-0 left-0 '>
                        <CreateApiForm toggleCreateApiFrameFun={toggleCreateApiFrameFun} />
                    </div>
                ) : (
                    <></>
                )
            }

            {/* nabbar frame */}
            <div className="navbarFrame">
                <NavbarFrame />
            </div>


            {/* side bar frame */}
            <div className="sidebarFrame">
                <ProviderSidebarFrame />
            </div>

            <div className="providerMainFrame_PAF bg-gray-900">

                <div className="apiListFrame h-[10vh] w-full bg-gray-700 flex flex flex-row items-center justify-between px-[1vw]">

                    <p className='text-gray-100 text-[2vw] font-[600] capitalize'>your api's list</p>

                    <button className="h-[3vw] w-[12vw] bg-gray-800 rounded-2xl text-[1.3vw] font-semibold text-gray-100 cursor-pointer" onClick={() => { toggleCreateApiFrameFun(true) }}>
                        Create API
                    </button>

                </div>

                <div className="apiListInformationList h-[120vh] w-full flex flex-col">

                    <div className="apiListInfoCont p-5">

                        {
                            providerApis?.length > 0 ? (
                                <>


                                    {

                                        providerApis?.map((api, i) => (
                                            <ProviderApiDetaiFrame
                                                api={api}
                                            />
                                        ))

                                    }
                                </>

                            ) : (
                                <div className='h-[20vh] w-[100%] bg-gray-600 rounded-2xl flex items-center justify-center'>
                                    <p className='text-[2vw] font-[600] text-gray-300 capitalize'>no api list </p>
                                </div>
                            )
                        }

                    </div>

                </div>









            </div>



        </div>
    )
}

export default ProviderApiFrame
