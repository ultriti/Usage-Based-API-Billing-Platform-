import React, { useEffect, useState } from "react";
import "../ApiFrame/providerApiFrame.css";
import NavbarFrame from "../../../../components/providerComponents/NavbarFrame";
import ProviderSidebarFrame from "../../../../components/providerComponents/ProviderSidebarFrame";
import axios from "axios";
import ProviderApiDetaiFrame from "../ApiFrame/ProviderApiDetaiFrame";
import PageDecoration from "../../../../components/providerComponents/PageDecoration";

const BillingProviderFrame = () => {
  const [billingApiData, setbillingApiData] = useState(null);
  const [billingApiChart, setbillingApiChart] = useState(null)

  const getBillingData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/provider/getApiBilling`,
        { withCredentials: true },
      );

      console.log("Billing data:", res.data);
      setbillingApiData(res.data.billingData);
      // Process and display the billing data as needed
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.data);
        // alert("Failed to fetch billing data: " + err.response.data.message);
      } else {
        console.error("Error fetching billing data:", err);
        // alert("Something went wrong!");
      }
    }
  };

  useEffect(() => {
    getBillingData();
  }, []);

  return (
    <div className="providerApiFrame  bg_dark_Theme_70">


      <PageDecoration/>
      {/* nabbar frame */}
      <div className="userNavbarFrame">
        <NavbarFrame />
      </div>

      {/* side bar frame */}
      <div className="sidebarFrame">
        <ProviderSidebarFrame />
      </div>

      {/* main frame */}
      <div className="providerMainFrame  ml-5">

        {/* graph */}
        {
          billingApiChart ? (
            <>
              <div className="providerChartFrame flex flex-row p-4 z-500">
          <div
            id="graphChart"
            className=" w-[80%] h-[70vh] text-white flex flex-col items-center p-4 rounded-lg shadow-lg"
          ></div>
          <div className="allChartsLeft bg-gray-400 h-[70vh] px-5 w-[30%] flex flex-col justify-between"></div>
        </div>
            </>
          ):(
            <></>
          )
        }
      

        {/* lower frame */}
        <div className="providerListApiFrame mt-6 z-500">
          {/* apis list  */}
          <div className="h-[100vh] w-[100%]  flex flex-col items-center">
            <div className="apiListCont flex flex-col items-center w-[95%] mt-5 gap-3">
              {
                console.log('billingApiData',billingApiData)
                
              }
              {billingApiData?.length > 0 ? (
                <>
                  {billingApiData?.map((api, i) => (
                    <>
                      <div className="h-[10vh] w-full bg-gray-800 rounded-2xl flex items-center justify-between px-6 text-white">
                        {/* Left side: profile image + name */}
                        <div className="flex items-center space-x-4">
                          <img
                            src={api?.profileImageUrl} // replace with actual image URL
                            alt={api?.username}
                            className="w-12 h-12 rounded-full border-2 border-white"
                          />
                          <div>
                            <h2 className="text-lg font-semibold">
                              {api?.username}
                            </h2>
                            <p className="text-sm text-gray-300">
                              {api?.email}
                            </p>
                          </div>
                        </div>

                        {/* Center: requests */}
                        <div className="text-center">
                          <p className="text-xl font-bold">
                            {/* {api?.totalRequest} requests */}
                          </p>
                        </div>

                        {/* Right side: amount paid */}
                        <div className="flex items-center space-x-2">
                          <p className="text-xl font-bold">
                            ₹{api?.totalAmount}
                          </p>
                          <span className="bg-green-500 text-xs px-2 py-1 rounded-full">
                            Paid
                          </span>
                        </div>
                      </div>
                    </>
                    // <ProviderApiDetaiFrame api={api} />
                  ))}
                </>
              ) : (
                <div className="h-[20vh] w-[100%] bg-gray-600 rounded-2xl flex items-center justify-center">
                  <p className="text-[2vw] font-[600] text-gray-300 capitalize">
                    no api list{" "}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingProviderFrame;
