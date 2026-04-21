import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import HomePage from './pages/HomePage.jsx/HomePage'
import UserRegister from './pages/AuthPages/UserAuth/UserRegister'
import DemoProviderGraph from './pages/DashBoard/DemoProvderGraph'
import ProviderRegister from './pages/AuthPages/ProviderAuth/ProviderRegister'
import ProviderLogin from './pages/AuthPages/ProviderAuth/ProviderLogin'
import ProviderDashboard from './pages/DashBoard/ProviderDashboard'

const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<HomePage/>} />

        {/* user routes */}
        <Route path="/user/Register" element={<UserRegister/>} />

        {/* provider routes */}
        <Route path="/provider/Register" element={<ProviderRegister/>} />
        <Route path="/provider/Login" element={<ProviderLogin/>} />

        <Route path="/provider/Dashboard" element={<ProviderDashboard/>} />

        <Route path="/provider/Graph" element={<DemoProviderGraph/>} />



      </Routes>
    </Router>
  )
}

export default App
