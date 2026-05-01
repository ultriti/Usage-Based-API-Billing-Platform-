import axios from "axios";
import React from "react";

const UserSubscriptionPage = () => {

     const subcribeToApi = async (amount) => {
    try {
      const apiData = {
        apiId: api?.id,
        amount: amount
      };

      alert(`${userDetailApi?._id} -- ${api?.id} -- ${apiData.apiId}`);
      const subscribeToApiAxios = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/apiGen/partialPayApi/${userDetailApi?._id}`,
        apiData,
        { withCredentials: true },
      );

      if (subscribeToApiAxios.status === 200) {
        alert(subscribeToApiAxios.data?.message || "Subscription successful");
        // getApiDetail();
      } else {
        alert(subscribeToApiAxios.data?.message || "Unexpected response");
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message || "Subscription failed");
      } else {
        alert(error.message);
      }
    }
  };
  return (
    <div className="m-h-[100vh] w-full bg_dark_Theme_70 flex flex-col items-center justify-center top-0 right-0 fixed z-500 mt-[6vw]">
      <div className="min-h-[50vh] w-[90%] grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-[10vw] bg-gray-500 flex items-center justify-center ">
        {/* Left Card: Daily Plan */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Daily API Plan
          </h2>
          <p className="text-gray-400 mb-4">Buy credits for requests</p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹20</div>
          <p className="text-gray-300 mb-6">Per recharge • 500 requests</p>
          <div className="w-full  text-white rounded-md font-medium">
            <UserPayment_razorpay amount={20} />
          </div>
          <div className="w-full  text-white rounded-md font-medium">
            <button
              className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
              onClick={() => {
                subcribeToApi(20);
              }}
            >
              demo pay
            </button>
          </div>
        </div>

        {/* montly plan
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Monthly API Plan
                  </h2>
                  <p className="text-gray-400 mb-4">Buy credits for requests</p>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    ₹499
                  </div>
                  <p className="text-gray-300 mb-6">
                    Per recharge • 25,000 requests
                  </p>
                  <div className="w-full  text-white rounded-md font-medium">
                    <UserPayment_razorpay amount={499} />
                  </div>
                  <div className="w-full  text-white rounded-md font-medium">
                    <button
                      className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
                      onClick={() => {
                        subcribeToApi(499);
                      }}
                    >
                      demo pay
                    </button>
                  </div>
                </div> */}

        {/* Right Card: Yearly Plan */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Yearly API Plan
          </h2>
          <p className="text-gray-400 mb-4 flex-wrap text-center">
            Unlimited access for one year, limit (5,00,000 requests)
          </p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹15,000</div>

          <p className="text-gray-300 mb-6">Flat annual subscription</p>

          <div className="w-full text-white rounded-md font-medium">
            <UserPayment_razorpay amount={15000} />
          </div>
          <div className="w-full  text-white rounded-md font-medium">
            <button
              className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
              onClick={() => {
                subcribeToApi(15000);
              }}
            >
              demo pay
            </button>
          </div>
        </div>
      </div>

      {/* monthly plan sub */}
      <div className="m-h-[50vh] w-[90%] grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-[4vw] bg-gray-500">
        {/* Starter Plan */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Starter Monthly
          </h2>
          <p className="text-gray-400 mb-4">Buy credits for requests</p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹500</div>
          <p className="text-gray-300 mb-6">Per month • 25,000 requests</p>
          <div className="w-full text-white rounded-md font-medium">
            <UserPayment_razorpay amount={500} />
          </div>
          <div className="w-full text-white rounded-md font-medium">
            <button
              className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
              onClick={() => {
                subcribeToApi(500);
              }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Growth Plan */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Growth Monthly
          </h2>
          <p className="text-gray-400 mb-4">Buy credits for requests</p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹1,500</div>
          <p className="text-gray-300 mb-6">Per month • 1,00,000 requests</p>
          <div className="w-full text-white rounded-md font-medium">
            <UserPayment_razorpay amount={1500} />
          </div>
          <div className="w-full text-white rounded-md font-medium">
            <button
              className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
              onClick={() => {
                subcribeToApi(1500);
              }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-2">Pro Monthly</h2>
          <p className="text-gray-400 mb-4">Buy credits for requests</p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹3,000</div>
          <p className="text-gray-300 mb-6">Per month • 2,50,000 requests</p>
          <div className="w-full text-white rounded-md font-medium">
            <UserPayment_razorpay amount={3000} />
          </div>
          <div className="w-full text-white rounded-md font-medium">
            <button
              className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
              onClick={() => {
                subcribeToApi(3000);
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionPage;
