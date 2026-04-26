import React from 'react'
import "./App.css"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import HomePage from './pages/HomePage.jsx/HomePage'
import UserRegister from './pages/AuthPages/UserAuth/UserRegister'
import DemoProviderGraph from './pages/DashBoard/Provider Dashboard/DemoProvderGraph'
import ProviderRegister from './pages/AuthPages/ProviderAuth/ProviderRegister'
import ProviderLogin from './pages/AuthPages/ProviderAuth/ProviderLogin'

import ProviderDashboard from './pages/DashBoard/Provider Dashboard/ProviderDashboard'
import ProviderApiFrame from './pages/DashBoard/Provider Dashboard/ApiFrame/ProviderApiFrame'
import PieChartExample from './pages/DashBoard/Provider Dashboard/DemoProvderGraph'
import AdminContext from './context/AdminContext'
import AdminProtectedWrapper from './context/AdminProtectedWrapper'
import UserHomePage from './pages/UserPages/UserHomePage'
import UserLogin from './pages/AuthPages/UserAuth/UserLogin'

const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<HomePage />} />

        {/* user routes */}
        <Route path="/user/Register" element={<UserRegister />} />
        <Route path="/user/login" element={<UserLogin />} />


        <Route path="/user/HomePage" element={<UserHomePage />} />

        {/* provider routes */}
        <Route path="/provider/Register" element={<ProviderRegister />} />
        <Route path="/provider/Login" element={<><AdminContext><ProviderLogin /> </AdminContext></>} />

        <Route path="/provider/Dashboard" element={<><AdminProtectedWrapper><ProviderDashboard /></AdminProtectedWrapper></>} />
        <Route path="/provider/providerApi" element={<ProviderApiFrame />} />

        <Route path="/provider/Graph" element={<PieChartExample />} />



      </Routes>
    </Router>
  )
}

export default App
