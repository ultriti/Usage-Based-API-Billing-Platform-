import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx/HomePage";
import UserRegister from "./pages/AuthPages/UserAuth/UserRegister";
import DemoProviderGraph from "./pages/DashBoard/Provider Dashboard/DemoProvderGraph";
import ProviderRegister from "./pages/AuthPages/ProviderAuth/ProviderRegister";
import ProviderLogin from "./pages/AuthPages/ProviderAuth/ProviderLogin";

import ProviderDashboard from "./pages/DashBoard/Provider Dashboard/ProviderDashboard";
import ProviderApiFrame from "./pages/DashBoard/Provider Dashboard/ApiFrame/ProviderApiFrame";
import PieChartExample from "./pages/DashBoard/Provider Dashboard/DemoProvderGraph";
import AdminContext from "./context/AdminContext";
import AdminProtectedWrapper from "./context/AdminProtectedWrapper";
import UserHomePage from "./pages/UserPages/UserHomePage/UserHomePage";
import UserLogin from "./pages/AuthPages/UserAuth/UserLogin";
import ApiDetailFrameTemplate from "./pages/UserPages/UserHomePage/ApiDetailFrameTemaplate";
import ApiRequest from "./pages/ApiRequest";
import UserContext from "./context/UserContext";
import UserProtectedWrapper from "./context/UserProtectedWrapper";
import CategoryFrame from "./pages/UserPages/CategoryPages/CategoryFrame";
import DemoPayment from "./components/payment/DemoPayment";
import PageNotFound from "./pages/CommonPages/PageNotFound";
import BillingProviderFrame from "./pages/DashBoard/Provider Dashboard/BillingFrame/BillingProviderFrame";
import UserProfilePage from "./pages/DashBoard/User Dashboard/UserProfilePage";
import UserLogout from "./pages/AuthPages/UserAuth/UserLogout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<PageNotFound />} />

        {/* user routes */}
        <Route path="/user/Register" element={<UserRegister />} />
        <Route path="/user/login" element={<><AdminContext><UserContext><UserLogin /></UserContext></AdminContext></>}/>
        <Route path="/user/logout" element={<><AdminContext><UserContext><UserLogout /></UserContext></AdminContext></>}/>

        <Route path="/user/homePage" element={<><UserProtectedWrapper><UserHomePage /></UserProtectedWrapper></>}/>

        <Route path="/user/apiDetailFrame" element={<ApiDetailFrameTemplate />}/>
        <Route path="/user/ProfilePage" element={<UserProfilePage />}/>

        <Route path="/user/apiDemoReq" element={<ApiRequest />} />
        <Route path="/user/category/:category" element={<CategoryFrame />} />

        {/* provider routes */}
        <Route path="/provider/Register" element={<AdminContext><UserContext><ProviderRegister /></UserContext>{" "}</AdminContext>} />
        <Route path="/provider/Login" element={ <> <AdminContext><UserContext><ProviderLogin /></UserContext>{" "}</AdminContext></>}/>

        <Route path="/provider/Dashboard" element={<><AdminProtectedWrapper><ProviderDashboard /></AdminProtectedWrapper></>}/>
        <Route path="/provider/billing" element={<BillingProviderFrame />} />
        <Route path="/provider/providerApi" element={<ProviderApiFrame />} />

        <Route path="/provider/Graph" element={<PieChartExample />} />

        {/* payment */}
        <Route path="/user/ultriti/payment" element={<DemoPayment />} />
      </Routes>
    </Router>
  );
};

export default App;
