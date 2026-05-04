import React, { useEffect, useState } from "react";
import "./ProviderDashboard.css";
import NavbarFrame from "../../../components/providerComponents/NavbarFrame";
import ProviderSidebarFrame from "../../../components/providerComponents/ProviderSidebarFrame";
import axios from "axios";
import CircularLoading_1 from "../../../components/CircularLoading_1.jsx";

import { getGraphData } from "../Graph";
import ProviderApiInfo from "./ProviderApiInfo";
import { fetchProviderApis } from "./GetProviderApis";
import { useNavigate } from "react-router-dom";

import { Line } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import PageDecoration from "../../../components/providerComponents/PageDecoration";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const ProviderDashboard = () => {
  const navigate = useNavigate();

  const [chartData, setChartData] = useState(null);
  const [query, setQuery] = useState("");
  const [providerApis, setproviderApis] = useState([]);
  const [pieChart, setpieChart] = useState(null);
  const [SelectTime, setSelectTime] = useState(1);
  const [isPageLoading, setisPageLoading] = useState(false);

  // fitions
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", query);
  };

  const fetchData = async (apiId) => {
    // alert(`${apiId}`)
    setisPageLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/apiGen/getProviderInfo?apiId=${apiId}&time=${SelectTime}`,
        {},
        { withCredentials: true },
      );

      setisPageLoading(false);
      const formatted = getGraphData(res.data);
      console.log("--------->", res.data);
      // console.log("---------> datasets",formatted.data.datasets.data)
      setChartData(formatted);

      // navigate("/graphChart")

      if (res.data.request < 500) {
        setisPageLoading(false);
        setpieChart({
          labels: ["requestSent", "totalRequests"],
          datasets: [
            {
              data: [res.data.request, 500], // values for each slice
              backgroundColor: ["#10B981", "#EF4444"], // green, red, amber
              borderColor: "#1F2937", // dark border
            },
          ],
        });

        setpieChart({
          labels: ["requestSent", "totalRequests"],
          datasets: [
            {
              data: [res.data.request, 500], // values for each slice
              backgroundColor: ["#10B981", "#EF4444"], // green, red, amber
              borderColor: "#1F2937", // dark border
            },
          ],
        });
      }
      setpieChart({
        labels: ["requestSent", "totalRequests"],
        datasets: [
          {
            data: [res.data.request, 500], // values for each slice
            backgroundColor: ["#10B981", "#EF4444"], // green, red, amber
            borderColor: "#1F2937", // dark border
          },
        ],
      });

      setpieChart({
        labels: ["requestSent", "totalRequests"],
        datasets: [
          {
            data: [res.data.request, 500], // values for each slice
            backgroundColor: ["#10B981", "#EF4444"], // green, red, amber
            borderColor: "#1F2937", // dark border
          },
        ],
      });
      setisPageLoading(false);
    } catch (err) {
      console.error("Error fetching graph data:", err);
      setisPageLoading(false);
    }
  };

  const getProviderApiFuntion = async () => {
    setisPageLoading(true);
    const data = await fetchProviderApis();
    console.log("providerApis", data);
    setproviderApis(data.providerApi);
    setisPageLoading(false);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff", // white text for dark mode
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  //
  const timeArray = ["1h", "5h", "12h", "24h", "7d", "30d"];

  useEffect(() => {
    getProviderApiFuntion();
  }, [10000]);

  return (
    <div className="mainFrameDashboard bg_dark_Theme_70">
      <PageDecoration />

      {/* navbar frame */}
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
        {chartData ? (
          <>
            <div className="providerChartFrame flex flex-row p-4 z-500">
              <div
                id="graphChart"
                className="bg-gray-900 w-[70%] h-[70vh] text-white flex flex-col items-center p-4 rounded-lg shadow-lg"
              >
                <div className="h-[7vh] w-full  flex flex-row items-center justify-center gap-5">
                  <h2 className="text-xl font-semibold mb-4 ">
                    API Latency & Status Graph
                  </h2>

                  <div className="w-30">
                    <select
                      value={SelectTime}
                      onChange={(e) => setSelectTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {timeArray.map((time) => (
                        <option
                          key={time}
                          value={time}
                          className="bg-gray-800 text-gray-100"
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {chartData ? (
                  <Line data={chartData.data} options={chartData.options} />
                ) : (
                  <p>Loading...</p>
                )}
              </div>

              <div className="allChartsLeft h-[70vh] px-5 w-[30%] flex flex-col justify-between">
                <div className=" w-[100%] h-[32vh] bg-gray-900 text-white flex flex-col items-center p-4 rounded-lg shadow-lg">
                  {pieChart ? (
                    <Pie data={pieChart} options={options} />
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
                {/* <div className=" w-[100%] h-[32vh] text-white bg-gray-100 flex flex-col items-center p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">API Status Distribution</h2>
                    <Pie data={data} options={options} />
                </div> */}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="h-[10vh] w-full flex items-center justify-center">
              <div className="h-[8vh] w-[80%] rounded-2xl bg-gray-900 text-gray-200 text-[1.5vw] flex items-center justify-center">
                <p>select an api to analyze the data</p>
              </div>
            </div>
          </>
        )}

        {/* API List Section */}
        <div className="providerListApiFrame z-500">
          <div className="apiListTitle flex justify-between items-center p-5 bg-gray-700 z-500">
            <p className="apiTitle text-[1.5vw] font-medium  text-gray-50">
              Your API's Lists
            </p>

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
          <div className="h-[100%] w-full  flex flex-col items-center ">
            <div className="apiListCont flex flex-col items-center w-[95%] mt-5 gap-3 z-500">
              {providerApis.length > 0 ? (
                <>
                  {providerApis?.map((api, i) => (
                    <div>
                      <ProviderApiInfo
                        key={api._id}
                        id={api._id}
                        logo={"api.logo"}
                        name={api.name}
                        requests={api.billing.totalRequests}
                        active={api.status}
                        chartData={"api.chartData"}
                        platformUrl={api.platformUrl}
                        revenue={api.billing.amount}
                        fetchData={fetchData}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div className="h-[20vh] w-[100%] bg-gray-600 rounded-2xl flex items-center justify-center">
                  <p className="text-[2vw] font-[600] text-gray-300 capitalize">
                    no api list{" "}
                  </p>
                </div>
              )}
              {isPageLoading ? (
                <>
                  <CircularLoading_1 />
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
