// import React from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const UserPayment_razorpay = ({ amount }) => {
//   const navigate = useNavigate()
//   const serialized = localStorage.getItem("userDeatils");
//   const userDetail = serialized ? JSON.parse(serialized) : null;

//   const razorpayKey =
//     import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SjYP78XCXQDWg2";
//   const apiBase = import.meta.env.VITE_BACKEND_URL_RD || "";

//   const handlePayment = async () => {
//     if (!window.Razorpay) {
//       alert("Razorpay SDK not loaded");
//       return;
//     }

//     try {
//       // ✅ Step 1: Ask backend to create order
//       const { data: order } = await axios.post(`${apiBase}/api/ultriti/payment/create-order`,{ amount },{ withCredentials: true });

//       // ✅ Step 2: Configure Razorpay Checkout
//       const options = {
//         key: razorpayKey,
//         amount: order.amount,
//         currency: order.currency,
//         name: "API Billing App",
//         description: `Payment of ₹${amount}`,
//         order_id: order.id,
//         handler: async function (response) {
//           // ✅ Step 3: Verify payment with backend
//           const verifyRes = await axios.post(
//             `${apiBase}/api/ultriti/payment/verify-payment`,
//             response,
//             { withCredentials: true },
//           );
//           if (verifyRes.data.success) {
//             navigate("/")
//             alert("Payment successful!");
//           } else {
//             alert("Payment verification failed!");
//           }
//         },
//         prefill: {
//           name: `${userDetail?.username}`,
//           email: `${userDetail?.email}`,
//           contact: "9999999999",
//         },
//         theme: {
//           color: "#3399cc",
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("Payment error:", err);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={handlePayment}
//         className="w-full py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium cursor-pointer"
//       >
//         subscribe ₹{amount}
//       </button>
//     </div>
//   );
// };

// export default UserPayment_razorpay;

import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserPaymentRazorpay = ({ amount, api, type }) => {
  const navigate = useNavigate();

  // ✅ Get user details from localStorage
  const userDetail = JSON.parse(localStorage.getItem("userDeatils") || "{}");

  // ✅ Environment variables
  const razorpayKey =
    import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_defaultKey";
  const apiBase = import.meta.env.VITE_BACKEND_URL_RD || "";

  const handlePayment = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    try {
      // Create order via backend
      const { data: order } = await axios.post(
        `${apiBase}/api/ultriti/payment/create-order`,
        { amount },
        { withCredentials: true },
      );

      const order_ = order;

      // Configure Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "API Billing App",
        description: `Payment of ₹${amount}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            //  Verify payment with backend
            const { data } = await axios.post(
              `${apiBase}/api/ultriti/payment/verify-payment`,
              response,
              { withCredentials: true },
            );

            if (data.success) {

              // transaction detaoils -----------------------
              const TransactionData = {
                consumerId: userDetail,
                amount: amount,
                apiId: api.id,
                providerId: api?.providerId,
              };

              const  Transdata  = await axios.post(`${apiBase}/api/transaction/creatTansaction`,TransactionData,{ withCredentials: true });

              alert("Payment pending wait for a min!");

              const apiData = {
                apiId: api?.id,
                amount: amount,
                type: type,
              };


              try {
                // after payment conformation -> api paymnet proceed
              const res = await axios.post(`${apiBase}/api/apiGen/partialPayApi/${userDetail?._id}`,apiData,{ withCredentials: true });

              if (res.status) {

                console.log('Transdata\n\n\n',Transdata.data.transaction)
                console.log('order\n\n\n',order || order_)
                
                // transaction data here ----------------------------------------------
                const TransactionData = {
                  txnId : Transdata.data.transaction._id, status : "settling", transactionRef : order?.receipt || order_?.receipt
                };

                console.log("TransactionData\n",TransactionData)

                const TransUpdatedData = await axios.post(`${apiBase}/api/transaction/updateTansaction`,TransactionData,{ withCredentials: true });

                if(TransUpdatedData.status == 200){
                  alert("trnas updated succss!")
                }else{
                  alert("TransUpdatedData failed !")
                }



                alert("Payment successful!");
              } else {
                alert("Payment unsuccessful! ------------- ");
              }
                
              } catch (error) {
                console.log(error)
              }
              
            } else {
              alert("Payment verification failed!");
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert("Error verifying payment!");
          }
        },
        prefill: {
          name: userDetail?.username || "Guest User",
          email: userDetail?.email || "guest@example.com",
          contact: userDetail?.contact || "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong while initiating payment.");
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        className="w-full py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors"
      >
        Subscribe ₹{amount}
      </button>
    </div>
  );
};

export default UserPaymentRazorpay;
