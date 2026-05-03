import React, { useState } from "react";
import AdminSidebar from "../../../components/Admin Components/AdminSidebar";
import PageDecoration from "../../../components/providerComponents/PageDecoration";
import UserProfile from "../User Dashboard/UserProfile";
import AdminApiFrame from "./AdminApiFrame";
import AdminProtectedWrapper from "../../../context/AdminProtectedWrapper";
import AdminProviderFrame from "./AdminProviderFrame";

const AdminDashboard = () => {
  const [activeSetting, setActiveSetting] = useState(null);

  const renderSettingContent = (user) => {
    switch (activeSetting) {
      case "api":
        return (
          <AdminApiFrame
            setActiveSetting={setActiveSetting}
            activeSetting={activeSetting}
            user={user}
          />
        );
      case "provider":
        return (
          <AdminProviderFrame
            setActiveSetting={setActiveSetting}
            activeSetting={activeSetting}
          />
        );
      // case "profileEdit":
      //   return (
      //     <UserProfileEdit
      //       setActiveSetting={setActiveSetting}
      //       activeSetting={activeSetting}
      //     />
      //   );
      // case "UserLogout":
      //   return <UserLogout />;
      // default:
      //   return (
      //     <UserProfile
      //       setActiveSetting={setActiveSetting}
      //       activeSetting={activeSetting}
      //     />
      //   );
    }
  };

  return (
    <div className="adminMainFrameFull bg_dark_Theme_70 overflow-y-scroll">
      <PageDecoration />

      {/* admin navbar */}
      <div className="userNavbarFrame"></div>

      {/* admin side bar */}
      <div className="AdminSidebarFrame">
        <AdminSidebar
          setActiveSetting={setActiveSetting}
          activeSetting={activeSetting}
        />
      </div>

      <div className="bg_dark_Theme_70 min-h-fit w-full mt-[2vw] ml-[16.1vw]">
        <div className="bg_dark_Theme_70 w-full flex z-50 rounded-[10px]">
          {renderSettingContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
