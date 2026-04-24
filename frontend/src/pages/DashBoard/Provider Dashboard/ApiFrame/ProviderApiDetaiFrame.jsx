import React, { useEffect, useState } from 'react'

import "./providerApiFrame.css"
import axios from 'axios'
import { fetchProviderApis } from '../GetProviderApis';

const ProviderApiDetaiFrame = ({ api }) => {
    const [providerApis, setproviderApis] = useState([])
    const [status_, setstatus_] = useState(api?.status)


    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const res = await axios.post("http://localhost:3000/api/apiGen/createApi", formData, { withCredentials: true });

    //         console.log("API Created:", res.data);
    //         alert("API created successfully!");

    //     } catch (err) {
    //         console.error(err);
    //         alert("Error creating API");
    //     }
    // }


    // funtions 


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCopy = (url) => {
        navigator.clipboard.writeText(url).then(() => {
            console.log("Copied:", url);
            alert("Copied to clipboard!");
        });
    };


    const apiStatusUpdate = async (apiId, status) => {
        console.log("status:::", status)

        try {
            const toggleStatus = await axios.put(`http://localhost:3000/api/apiGen/updateApiStatus/${apiId}`, { status }, { withCredentials: true });

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

    return (
        <>
            <div className="apiListedFrame h-[50vh] mb-5 w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">

                {/* Top Frame */}
                <div className="apiTitleInfo h-[8vh] w-full bg-gray-700 flex flex-row items-center px-6 justify-between">
                    {/* API Name */}
                    <p className="text-white font-semibold text-xl truncate">{api.name}</p>

                    {/* Active / Inactive Toggle */}

                    <label className="inline-flex items-center cursor-pointer ml-4">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={(api.active == "active" ? true : false)}
                            onClick={() => apiStatusUpdate(api._id, status_)}
                        />

                        {
                            // toggleActive ? (
                            (status_ == "active" ? true : false) ? (
                                <>
                                    <div className="w-11 h-6 bg-green-500 flex items-center rounded-full peer peer-checked:bg-green-500 relative transition">
                                        <div className="absolute  right-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${status_ == "active" ? "text-green-400" : "text-red-400"}`}>
                                        {status_ == "active" ? "Active" : "Inactive"}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gray-500 relative transition">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${status_ == "active" ? "text-green-400" : "text-red-400"}`}>
                                        {status_ == "active" ? "active" : "Inactive"}
                                    </span>
                                </>
                            )
                        }

                    </label>

                </div>

                {/* Middle Frame */}
                <div className="h-[90%] w-full bg-gray-800 flex flex-row p-4">

                    {/* Left Section */}
                    <div className="apiDetailFrameLeft h-full w-[70%] flex flex-col gap-4">

                        {/* Description */}
                        <div className="h-[12.5vh] w-[95%] bg-gray-700 text-sm text-gray-500 font-medium p-2 rounded-md line-clamp-2">
                            {/* {api.description} */} Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus expedita eos sequi dolorum voluptas debitis repellat voluptate atque deleniti delectus quia, commodi, laudantium sint ea?, Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex vitae earum quibusdam voluptatum culpa reprehenderit ipsam obcaecati ab? Maiores possimus odit numquam libero iste odio iure, culpa ipsum harum ab magnam iusto maxime debitis molestias ut magni. Maxime, autem sed et consequuntur laudantium, suscipit sapiente quaerat provident sunt excepturi vel saepe eaque! Voluptates perspiciatis neque excepturi ad atque non aperiam quibusdam! Reprehenderit harum corrupti excepturi laborum aliquid repellat placeat qui. Non, iste velit accusamus neque cupiditate odio debitis iusto ex sed dolores similique, fuga esse error? Nihil fugit perferendis maiores aliquam ut reprehenderit doloribus provident dignissimos nulla, sit tenetur, delectus asperiores molestias a autem, unde illo. Eveniet asperiores molestiae vitae porro nesciunt adipisci ipsam non excepturi perspiciatis quasi iusto rerum, unde fugit illo atque delectus dolor quae in iste labore voluptate dolorum expedita veritatis nemo. Consectetur suscipit eum officiis deserunt expedita repellendus, tempore soluta, blanditiis est nostrum ea distinctio earum laudantium nisi, culpa consequuntur? Quod voluptate facilis sit sint harum recusandae doloremque fugit deleniti provident! Sapiente, assumenda. Doloremque placeat omnis nesciunt nihil fugit rerum quasi, veritatis accusamus excepturi maxime neque sequi ratione cupiditate atque, ducimus asperiores mollitia ad eaque saepe ab. Earum tempore suscipit excepturi vero, facilis aut beatae reiciendis.
                        </div>

                        {/* API Key Copy */}
                        <div className="h-[12vh] w-[90%] bg-gray-700 flex items-center justify-center rounded-lg">
                            <div
                                className="w-[90%] flex rounded-lg shadow-md cursor-pointer"
                                onClick={() => handleCopy(api.baseUrl)}
                            >
                                <input
                                    type="text"
                                    value={api.baseUrl}
                                    readOnly
                                    className="flex-grow px-3 py-2 bg-gray-800 text-gray-400 truncate rounded-l-md focus:outline-none cursor-pointer"
                                />
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-r-md hover:bg-green-700 transition"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="apiInteractionDetailRight h-full w-[30%] flex flex-col gap-3 items-center justify-center">

                        <div className="h-[8vh] w-[19vw] bg-gray-700 rounded-2xl flex items-center justify-between px-5 text-lg font-semibold text-gray-200">
                            <p>$ {api.billing.amount}</p>
                        </div>

                        <div className="h-[8vh] w-[19vw] bg-gray-700 rounded-2xl flex items-center px-5 text-lg font-semibold text-gray-200">
                            <p>{api.billing.totalRequests}</p>
                            <span className="ml-2 text-sm text-gray-400">requests</span>
                        </div>

                        <div className="h-[8vh] w-[19vw] bg-gray-700 rounded-2xl flex items-center px-5 text-lg font-semibold text-gray-200">
                          <p>{new Date(api.createdAt).toISOString().split("T")[0]}</p>

                        </div>
                    </div>
                </div>


            </div></>
    )
}

export default ProviderApiDetaiFrame
