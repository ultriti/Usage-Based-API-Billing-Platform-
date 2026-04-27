// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./ProviderRegister.css";

// const ProviderRegister = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     role: "provider",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(
//         "http://localhost:3000/api/provider/providerRegister",
//         formData,
//         { withCredentials: true }
//       );

//       if (res.status === 201) {
//         alert("Provider registered successfully!");
//         console.log("Response:", res.data);
//         navigate("/provider/Dashboard");
//       } else {
//         alert("Error: " + res.data.message);
//       }
//     } catch (err) {
//       console.error("Error submitting form:", err);
//       alert("Something went wrong!");
//     }
//   };

//   return (
//     <div className="userLoginFrame flex items-center justify-center h-screen bg-gray-100">
//       <div className="userLoginFrameCont flex w-4/5 h-4/5 p-10 flex-row shadow-lg rounded-2xl overflow-hidden">

//         {/* Left side - Register form */}
//         <div className="flex-1 flex flex-col justify-center gap-1 items-center w=[50%] h-[100%] p-10">
//           <h2 className="text-2xl font-bold">Register</h2>
//           <form
//             className="flex flex-col h-[60vh] w-full gap-3 justify-center items-center"
//             onSubmit={handleSubmit}
//           >
//             <label className="mb-2 text-gray-50">Username</label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//               className="p-3 mb-4 border h-10 w-[60%] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//             <label className="mb-2 text-gray-50">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="p-3 mb-4 border h-10 w-[60%] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//             <label className="mb-2 text-gray-50">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               className="p-3 mb-4 border h-10 w-[60%] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//             <label className="mb-2 text-gray-50">Role</label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className="p-3 mb-4 border h-10 w-[60%] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="provider">Provider</option>
//               <option value="admin">Admin</option>
//               <option value="user">User</option>
//             </select>

//             <button
//               type="submit"
//               className="bg-blue-600 h-10 w-[60%] mt-1 text-white py-3 rounded-md hover:bg-blue-700 transition"
//             >
//               Register
//             </button>
//           </form>
//           <p className="mt-1 text-gray-300 text-sm cursor-pointer" onClick={()=>{navigate("/provider/login")}}>Already have an account?</p>
//         </div>

//         {/* Right side - Illustration/info */}
//         <div className="flex-1 flex flex-col justify-center h-full w-1/2 items-center bg-blue-500 relative">
//           <img
//             src="https://thf.bing.com/th/id/OIP.z_LRhuaZZLcekDExDPuDfgHaEK?w=310&h=180&c=7&r=0&o=7&cb=thfc1&dpr=1.5&pid=1.7&rm=3"
//             alt=""
//             className="h-[100%] w-[100%] object-cover relative"
//           />
//           <div className="leftCont h-[100%] w-[90%] flex-1 flex flex-col justify-end absolute p-10">
//             <h3 className="text-xl font-semibold mb-1 text-white mt-5">
//               Join and Track Your Progress
//             </h3>
//             <p className="text-gray-100 mb-6">
//               Register now to access your provider dashboard and monitor your
//               project growth.
//             </p>
//             <div className="text-6xl text-center mb-5">🚀📊📈</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProviderRegister;




// ProviderRegister.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProviderRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "provider",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/provider/providerRegister",
        formData,
        { withCredentials: true }
      );

      if (res.status === 201) {
        alert("Provider registered successfully!");
        console.log("Response:", res.data);
        navigate("/provider/dashboard");
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (err) {
      if (err.response) {
        console.error("Backend error:", err.response.data);
        alert("Login failed: " + err.response.data.message);
      } else {
        console.error("Error logging in:", err);
        alert("Something went wrong!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-700 to-blue-900">
      <div className="bg-gray-900 text-gray-100 rounded-lg shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Provider Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="provider">Provider</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            Register
          </button>
        </form>

        <div className="routeLoginFrame h-[10vh] w-full flex items-center justify-center">
          <p
            className="mt-1 text-gray-300 text-sm cursor-pointer"
            onClick={() => navigate("/provider/login")}
          >
            Already have an account? Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderRegister;
