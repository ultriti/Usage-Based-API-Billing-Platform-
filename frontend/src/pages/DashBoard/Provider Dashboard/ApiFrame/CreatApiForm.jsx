import React, { useState } from "react";
import axios from "axios";
import "./providerApiFrame.css"

const CreateApiForm = ({toggleCreateApiFrameFun}) => {

  const [formData, setFormData] = useState({
    providerId: "",
    baseUrl: "",
    name: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/apiGen/createApi",
        formData,{withCredentials:true}
      );
      console.log("API Created:", res.data);
      alert("API created successfully!");
      toggleCreateApiFrameFun(false)
    } catch (err) {
      console.error(err);
      alert("Error creating API");
    }
  };

  return (
    <div className="createApiFrame flex flex-col items-center h-[70%] w-[50%] bg-gray-800  rounded-lg shadow-lg overflow-hidden">
      <div className="exitFrame h-[7vh] w-full bg-gray-600 flex justify-end justify-center items-center">
          <button className="h-[2vw] w-[2vw] bg-red-600 mr-5 flex items-center justify-center rounded-[5px] cursor-pointer" onClick={()=>{toggleCreateApiFrameFun(false)}}>
              x
          </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl grid grid-cols-2 gap-6 text-white py-5 px-5 flex justify-center items-center"
      >
        <h2 className="col-span-2 text-2xl font-semibold text-center mb-2">
          Create New API
        </h2>

        {/* Row 1: Provider ID + Base URL */}
        {/* <div className="flex flex-col"> */}
          {/* <label className="mb-1 text-sm font-medium">Provider ID</label>
          <input
            type="text"
            name="providerId"
            value={formData.providerId}
            onChange={handleChange}
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="69e60dc693bbde7e2472285c"
            required
          />
        </div> */}

        <div className="flex flex-col col-span-2">
          <label className="mb-1 text-sm font-medium">Base URL</label>
          <input
            type="text"
            name="baseUrl"
            value={formData.baseUrl}
            onChange={handleChange}
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://jsonplaceholder.typicode.com/todos"
            required
          />
        </div>

        {/* Row 2: Name (spans full width) */}
        <div className="col-span-2 flex flex-col">
          <label className="mb-1 text-sm font-medium">API Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="todo list app"
            required
          />
        </div>

        {/* Submit button full width */}
        <div className="col-span-2">
          <button
            type="submit"
            className="w-full py-2 rounded-md bg-green-600 hover:bg-green-700 transition font-semibold"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateApiForm;
