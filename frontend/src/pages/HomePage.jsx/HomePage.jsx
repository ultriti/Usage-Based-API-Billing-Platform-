import React from 'react'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 text-white">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
        MeterFlow - Usage-Based API Billing
      </h1>

      {/* Description */}
      <p className="text-lg text-gray-200 text-center max-w-2xl mb-8">
        Build, manage, and monetize APIs with real-time usage tracking and
        billing. Choose your role to get started with MeterFlow.
      </p>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-6">
        <button onClick={()=>{navigate("/user/HomePage")}} className="px-8 py-4 rounded-lg bg-green-500 hover:bg-green-600 transition font-semibold shadow-lg">
          Consumer
        </button>
        <button onClick={()=>{navigate("/provider/Dashboard")}} className="px-8 py-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition font-semibold shadow-lg">
          Provider
        </button>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-gray-400">
        Inspired by Stripe Billing, RapidAPI, and AWS API Gateway
      </p>
    </div>
  );
};



export default HomePage
