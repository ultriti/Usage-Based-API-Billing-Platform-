import React, { useEffect, useState } from 'react';
import "./ProviderDashboard.css";
import NavbarFrame from '../../components/NavbarFrame';
import ProviderSidebarFrame from '../../components/providerComponents/ProviderSidebarFrame';
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { getGraphData } from "./Graph";
import ProviderApiInfo from './ProviderApiInfo';
import { fetchProviderApis } from './Provider Dashboard/GetProviderApis';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);



const ProviderDashboard = () => {

    const [chartData, setChartData] = useState(null);
    const [query, setQuery] = useState("");
    const [providerApis, setproviderApis] = useState([])


    // fitions 
    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Searching for:", query);
    };

    const fetchData = async () => {
        try {
            const res = await axios.post("http://localhost:3000/api/apiGen/getProviderInfo", {}, { withCredentials: true });
            const formatted = getGraphData(res.data);
            setChartData(formatted);

            const data = await fetchProviderApis();
            console.log("providerApis", data)
            setproviderApis(data.providerApi);

        } catch (err) {
            console.error("Error fetching graph data:", err);
        }
    };


    // use effects 
    useEffect(() => {
        fetchData();
        // const interval = setInterval(fetchData, 5000);
        // return () => clearInterval(interval);
    }, [10000]);




    return (
        <div className="mainFrameDashboard">

            {/* nabbar frame */}
            <div className="navbarFrame">
                <NavbarFrame />
            </div>


            {/* side bar frame */}
            <div className="sidebarFrame">
                <ProviderSidebarFrame />
            </div>



            {/* main frame */}

            <div className="providerMainFrame">


                {/* Chart Section */}
                <div className="providerChartFrame flex flex-row p-4">


                    <div className="bg-gray-900 w-[70%] h-[70vh] text-white flex flex-col items-center p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">API Latency & Status Graph</h2>
                        {chartData ? (
                            <Line data={chartData.data} options={chartData.options} />
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>


                    <div className="allChartsLeft w-[30%] flex flex-col">

                    </div>


                </div>

                {/* API List Section */}
                <div className="providerListApiFrame mt-6">
                    <div className="apiListTitle flex justify-between items-center p-5 bg-gray-700">
                        <p className="apiTitle text-[1.5vw] font-medium  text-gray-50">Your API's Lists</p>

                        <form
                            onSubmit={handleSearch}
                            className="flex w-[40vw] items-center bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <input
                                type="text"
                                placeholder="Search APIs..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-grow px-4 py-2 text-gray-700 focus:outline-none"
                            />

                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Search
                            </button>

                        </form>


                        <button className="h-[3vw] w-[12vw] bg-gray-800 rounded-2xl text-[1.3vw] font-semibold text-gray-100">
                            Create API
                        </button>

                    </div>

                    {/* apis list  */}
                    <div className="h-[80vh] w-full bg-gray-900 mb-5 flex flex-col items-center ">
                        <div className="apiListCont flex flex-col items-center  w-[95%]  mt-5 gap-3">

                            {
                                providerApis?.map((api, i) => (

                                    <>
                                        <ProviderApiInfo
                                            key={api._id}
                                            id={api._id}
                                            logo={"api.logo"}
                                            name={api.name}
                                            requests={api.billing.totalRequests}
                                            active={api.status}
                                            chartData={"api.chartData"}
                                            baseUrl={api.baseUrl}
                                            revenue={api.billing.amount}
                                        />
                                    </>

                                ))
                            }


                        </div>

                    </div>
                </div>


            </div>
        </div>
    );
};

export default ProviderDashboard;
