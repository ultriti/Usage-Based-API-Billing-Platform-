import React from "react";
import UserPayment_razorpay from "../../../components/payment/UserPayment_razorpay";


const ApiSubscriptionFrame = ({apiDeatil,api}) => {
  return (
    <div className="h-[70vh] w-full grid mt-[2vw] grid-cols-1 md:grid-cols-3 gap-10 px-[4vw]  bg-gray-600 p-[2vw] rounded-[20px]">

        
      {/* Left Card: Daily Plan */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-around z-500">
        <div className="w-[100%] flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            partial payment
          </h2>
          <p className="text-gray-400 mb-4">Buy credits for requests</p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹{apiDeatil?.subscriptionPlan?.price?.partialpayment?.amount}</div>
          <p className="text-gray-300 mb-6">Per recharge • {apiDeatil?.subscriptionPlan?.price?.partialpayment?.requestLimit } requests</p>
        </div>
        <div className="w-full  text-white rounded-md font-medium">
          {/* <UserPayment_razorpay amount={20} /> */}
          <UserPayment_razorpay amount={apiDeatil?.subscriptionPlan?.price?.partialpayment?.amount} api={api} type={"partialpayment"} />
        </div>
      </div>

      {/* montly plan */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-around z-500">
        <div className="w-[100%] flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Monthly API Plan
          </h2>
          <p className="text-gray-400 mb-4">Buy credits for requests</p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹{apiDeatil?.subscriptionPlan?.price?.monthlypayment?.amount} </div>
          <p className="text-gray-300 mb-6">Per recharge • {apiDeatil?.subscriptionPlan?.price?.monthlypayment?.requestLimit}  requests</p>
        </div>

        <div className="w-full  text-white rounded-md font-medium">
          {/* <UserPayment_razorpay amount={499} /> */}
          <UserPayment_razorpay amount={apiDeatil?.subscriptionPlan?.price?.monthlypayment?.amount} type={"monthlypayment"}/>
        </div>
        {/* <div className="w-full  text-white rounded-md font-medium">
                      <button
                        className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
                        onClick={() => {
                          subcribeToApi(499, "monthlypayment");
                        }}
                      >
                        demo pay
                      </button>
                    </div> */}
      </div>

      {/* Right Card: Yearly Plan */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-around z-500">
        <div className="w-[100%] flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Yearly API Plan
          </h2>
          <p className="text-gray-400 mb-4 flex-wrap text-center">
            Unlimited access for one year, limit ({apiDeatil?.subscriptionPlan?.price?.annualpayment?.requestLimit} requests)
          </p>
          <div className="text-4xl font-bold text-green-400 mb-2">₹{apiDeatil?.subscriptionPlan?.price?.annualpayment?.amount}</div>

          <p className="text-gray-300 mb-6">Flat annual subscription</p>
        </div>

        <div className="w-full text-white rounded-md font-medium">
          {/* <UserPayment_razorpay amount={15000} /> */}
          <UserPayment_razorpay amount={apiDeatil?.subscriptionPlan?.price?.annualpayment?.amount} type={"annualpayment"} />
        </div>

      </div>

    </div>
  );
};

export default ApiSubscriptionFrame;


// 
// Left Card: Daily Plan
//                   <div className="bg-gray-800 h-[60vh] rounded-xl shadow-lg p-6 flex flex-col items-center justify-around">
//                     <div className="w-[100%] flex flex-col items-center justify-center">
//                       <h2 className="text-xl font-semibold text-white mb-2">
//                         {apiDeatil?.subscriptionPlan?.subscriptionType}partial API Plan
//                       </h2>
//                       <p className="text-gray-400 mb-4">
//                         Buy credits for requests
//                       </p>
//                       <div className="text-4xl font-bold text-green-400 mb-2">
//                         ₹20
//                       </div>
//                       <p className="text-gray-300 mb-6">
//                         Per recharge • 500 requests
//                       </p>
//                     </div>
//                     <div className="w-full  text-white rounded-md font-medium">
//                       {/* <UserPayment_razorpay amount={20} /> */}
//                       <UserPayment_razorpay
//                         amount={1}
//                         api={api}
//                         type={"partialpayment"}
//                       />
//                     </div>
//                     {/* <div className="w-full  text-white rounded-md font-medium">
//                       <button
//                         className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
//                         onClick={() => {
//                           subcribeToApi(20, "partialpayment");
//                         }}
//                       >
//                         demo pay
//                       </button>
//                     </div> */}
//                   </div>

//                   {/* montly plan */}
//                   <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-around">
//                     <div className="w-[100%] flex flex-col items-center justify-center">
//                       <h2 className="text-xl font-semibold text-white mb-2">
//                         Monthly API Plan
//                       </h2>
//                       <p className="text-gray-400 mb-4">
//                         Buy credits for requests
//                       </p>
//                       <div className="text-4xl font-bold text-green-400 mb-2">
//                         ₹499
//                       </div>
//                       <p className="text-gray-300 mb-6">
//                         Per recharge • 25,000 requests
//                       </p>
//                     </div>

//                     <div className="w-full  text-white rounded-md font-medium">
//                       {/* <UserPayment_razorpay amount={499} /> */}
//                       <UserPayment_razorpay amount={4} />
//                     </div>
//                     {/* <div className="w-full  text-white rounded-md font-medium">
//                       <button
//                         className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
//                         onClick={() => {
//                           subcribeToApi(499, "monthlypayment");
//                         }}
//                       >
//                         demo pay
//                       </button>
//                     </div> */}
//                   </div>

//                   {/* Right Card: Yearly Plan */}
//                   <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-around">
//                     <div className="w-[100%] flex flex-col items-center justify-center">
//                       <h2 className="text-xl font-semibold text-white mb-2">
//                         Yearly API Plan
//                       </h2>
//                       <p className="text-gray-400 mb-4 flex-wrap text-center">
//                         Unlimited access for one year, limit (5,00,000 requests)
//                       </p>
//                       <div className="text-4xl font-bold text-green-400 mb-2">
//                         ₹15,000
//                       </div>

//                       <p className="text-gray-300 mb-6">
//                         Flat annual subscription
//                       </p>
//                     </div>

//                     <div className="w-full text-white rounded-md font-medium">
//                       {/* <UserPayment_razorpay amount={15000} /> */}
//                       <UserPayment_razorpay amount={15} />
//                     </div>
//                     {/* <div className="w-full  text-white rounded-md font-medium">
//                       <button
//                         className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
//                         onClick={() => {
//                           subcribeToApi(15000, "annualpayment");
//                         }}
//                       >
//                         demo pay
//                       </button>
//                     </div> */}
//                   </div>




 {/* Left Card: Daily Plan */}
                // <div className="bg-gray-800 h-[60vh] rounded-xl shadow-lg p-6 flex flex-col items-center z-200">
                //   <h2 className="text-xl font-semibold text-white mb-2">
                //     {
                //       console.log("apiDeatil:\n",apiDeatil)
                //     }
                //     partial payment
                //   </h2>
                //   <p className="text-gray-400 mb-4">Buy credits for requests</p>
                //   <div className="text-4xl font-bold text-green-400 mb-2">
                //     ₹{apiDeatil?.subscriptionPlan?.price?.partialpayment?.amount}
                //   </div>
                //   <p className="text-gray-300 mb-6">
                //     Per recharge • {apiDeatil?.subscriptionPlan?.price?.partialpayment?.requestLimit} requests
                //   </p>
                //   <div className="w-full  text-white rounded-md font-medium">
                //     {/* <UserPayment_razorpay amount={20} /> */}
                //     <UserPayment_razorpay
                //       amount={apiDeatil?.subscriptionPlan?.price?.partialpayment?.amount}
                //       api={api}
                //       type={"partialpayment"}
                //     />
                //   </div>
                //   {/* <div className="w-full  text-white rounded-md font-medium">
                //     <button
                //       className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
                //       onClick={() => {
                //         subcribeToApi(20, "partialpayment");
                //       }}
                //     >
                //       demo pay
                //     </button>
                //   </div> */}
                // </div>

                // {/* montly plan */}
                // <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center z-200">
                //   <h2 className="text-xl font-semibold text-white mb-2">
                //     Monthly API Plan
                //   </h2>
                //   <p className="text-gray-400 mb-4">Buy credits for requests</p>
                //   <div className="text-4xl font-bold text-green-400 mb-2">
                //     ₹{apiDeatil?.subscriptionPlan?.price?.monthlypayment?.amount}
                //   </div>
                //   <p className="text-gray-300 mb-6">
                //     Per recharge • {apiDeatil?.subscriptionPlan?.price?.monthlypayment?.requestLimit} requests
                //   </p>
                //   <div className="w-full  text-white rounded-md font-medium">
                //     {/* <UserPayment_razorpay amount={499} /> */}
                //     <UserPayment_razorpay
                //       amount={apiDeatil?.subscriptionPlan?.price?.monthlypayment?.amount}
                //       api={api}
                //       type={"monthlypayment"}
                //     />
                //   </div>
                //   {/* <div className="w-full  text-white rounded-md font-medium">
                //     <button
                //       className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
                //       onClick={() => {
                //         subcribeToApi(499, "monthlypayment");
                //       }}
                //     >
                //       demo pay
                //     </button>
                //   </div> */}
                // </div>

                // {/* Right Card: Yearly Plan */}
                // <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center z-200">
                //   <h2 className="text-xl font-semibold text-white mb-2">
                //     Yearly API Plan
                //   </h2>
                //   <p className="text-gray-400 mb-4 flex-wrap text-center">
                //     Unlimited access for one year, limit ({apiDeatil?.subscriptionPlan?.price?.annualpayment?.requestLimit} requests)
                //   </p>
                //   <div className="text-4xl font-bold text-green-400 mb-2">
                //     ₹{apiDeatil?.subscriptionPlan?.price?.annualpayment?.amount}
                //   </div>

                //   <p className="text-gray-300 mb-6">Flat annual subscription</p>

                //   <div className="w-full text-white rounded-md font-medium">
                //     {/* <UserPayment_razorpay amount={15000} /> */}
                //     <UserPayment_razorpay
                //       amount={apiDeatil?.subscriptionPlan?.price?.annualpayment?.amount}
                //       api={api}
                //       type={"annualpayment"}
                //     />
                //   </div>
                //   {/* <div className="w-full  text-white rounded-md font-medium">
                //     <button
                //       className="w-full mt-10 py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
                //       onClick={() => {
                //         subcribeToApi(15000, "annualpayment");
                //       }}
                //     >
                //       demo pay
                //     </button>
                //   </div> */}
                // </div>