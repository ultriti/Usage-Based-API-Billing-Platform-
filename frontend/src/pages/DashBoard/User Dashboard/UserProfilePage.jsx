import React, { useEffect, useState } from "react";
import axios from "axios";
import UserNavbar from "../../../components/userComponents/UserNavbar";
import UserDashboardSidebar from "../../../components/userComponents/UserDashboardSidebar";
import PageDecoration from "../../../components/providerComponents/PageDecoration";
import UserProfile from "./UserProfile";
import UserApiUsingFrame from "./UserApiUsingFrame";
import UserProfileEdit from "./UserProfileEdit";
import UserLogin from "../../AuthPages/UserAuth/UserLogin";
import UserLogout from "../../AuthPages/UserAuth/UserLogout";

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSetting, setActiveSetting] = useState(null);

  const renderSettingContent = (user) => {
    switch (activeSetting) {
      case "ProfilePage":
        return (
          <UserProfile
            setActiveSetting={setActiveSetting}
            activeSetting={activeSetting}
            user={user}
          />
        );
      case "userApiList":
        return (
          <UserApiUsingFrame
            setActiveSetting={setActiveSetting}
            activeSetting={activeSetting}
          />
        );
      case "profileEdit":
        return (
          <UserProfileEdit
            setActiveSetting={setActiveSetting}
            activeSetting={activeSetting}
          />
        );
      case "UserLogout":
        return <UserLogout />;
      // case "info":
      //   return <SettingsInfoFrame />;
      // case "Security":
      //   return (
      //     <Security_Frame
      //       setActiveSetting={setActiveSetting}
      //       activeSetting={activeSetting}
      //     />
      //   );
      // case "MyApplication":
      //   return <ApplicationFrame />;
      // case "QNA":
      //   return <QNA_Frame />;
      // case "Settings":
      //   return <QNA_Frame />;

      default:
        return (
          <UserProfile
            setActiveSetting={setActiveSetting}
            activeSetting={activeSetting}
          />
        );
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL_RD}/api/user/userDetail`,
          { withCredentials: true },
        );

        setUser(res.data.userDetail); // adjust based on your API response
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <PageDecoration />

      {/* navbar frame */}
      <div className="userNavbarFrame">
        <UserNavbar />
      </div>

      {/* sideba frame */}
      <div className="userSidebarFrame">
        <UserDashboardSidebar
          setActiveSetting={setActiveSetting}
          activeSetting={activeSetting}
        />
      </div>

      {/* <div className="bg-gray-800 h-[93vh] w-full p-[2vw] mt-[4vw] flex items-center justify-center ml-[12vw]">

        <div className="userProfilePage_Sub_Frame h-full w-[96%] bg-gray-900 ml-[3vw] rounded-[10px] overflow-hidden">

        </div>
        
      </div> */}

      {/* here is  */}

      <div className="bg_dark_Theme_70 h-[93vh] w-full p-[2vw] mt-[4vw] flex items-center justify-center ml-[12vw]">
        <div className="userProfilePage_Sub_Frame h-full w-[96%]  bg-gray-900 ml-[3vw] rounded-[10px] overflow-hidden p-8 text-white">
          {renderSettingContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
