import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserNavbar from "../../../components/userComponents/UserNavbar";
import UserSidebar from "../../../components/userComponents/UserSidebar";
import axios from "axios";
import ApiTemplateFrame from "../UserHomePage/ApiTemplateFrame_HP";
import PageDecoration from "../../../components/providerComponents/PageDecoration";
import CircularLoading_1 from "../../../components/CircularLoading_1";

const CategoryFrame = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [allApis, getallApis] = useState([]);
  const [isPageLoading, setisPageLoading] = useState(false);

  const getAllApis = async () => {
    setisPageLoading(true);
    try {
      const getAllApisAxios = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/apiGen/getAllApi?category=${category}`,
        { withCredentials: true },
      );

      console.log(getAllApisAxios.data);

      if (getAllApisAxios.status === 200) {
        // alert("All APIs fetched successfully");
        console.log("---apis:", getAllApisAxios.data.allApi);
        getallApis(getAllApisAxios.data.allApi); // update state/context
        setisPageLoading(false);
      } else {
        alert(getAllApisAxios.data.message || "Unexpected response");
        setisPageLoading(false);
      }
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        alert(error.response.data.message || "Request failed");
        setisPageLoading(false);
      } else {
        console.error("Network error:", error);
        alert(error.message);
        setisPageLoading(false);
      }
    }
  };

  useEffect(() => {
    getAllApis();
  }, [category]);

  return (
    <div className="w-full h-[100vh] bg_dark_Theme_70">
      <div className="userNavbarFrame">
        <UserNavbar />
      </div>

      <div className="userSidebarFrame">
        <UserSidebar />
      </div>

      <PageDecoration />

      {/* main frame */}
      <div className="ApiCategoryMainFrame bg_dark_Theme_70">
        <div className="apiTemplateFrame h-[100%] w-[100%] py-5 flex gap-5 flex-wrap">
          {allApis.length > 0 ? (
            allApis?.map((api, i) => (
              <div
                onClick={() => {
                  navigate("/user/apiDetailFrame", {
                    state: {
                      api: {
                        id: api?._id,
                        name: api?.name,
                        platformUrl: api?.platformUrl,
                        description: api?.description,
                        keyCode: api?.key,
                        status: api?.status,
                        usage: 2,
                      },
                    },
                  });
                }}
              >
                <ApiTemplateFrame
                  name={api?.name}
                  link={api?.platformUrl}
                  description={api?.description}
                />
              </div>
            ))
          ) : (
            <div className="h-[10vh] rounded-[10px] capitalize w-full bg-gray-700 text-[1.5vw] text-gray-300 font-[700] flex items-center justify-center">
              <p>no api found for this category</p>
            </div>
          )}
         
        </div>
         {isPageLoading ? (
            <div className="h-[10vh] w-full flex items-center justify-center">
              <CircularLoading_1 />
            </div>
          ) : (
            <></>
          )}
      </div>
    </div>
  );
};

export default CategoryFrame;
