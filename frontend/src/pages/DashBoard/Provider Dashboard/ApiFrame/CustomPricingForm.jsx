import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const CustomPricingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFormData = location.state?.formData || {};

  const [custom, setCustom] = useState({
    partialpayment: { amount: "", requestLimit: "" },
    monthlypayment: { amount: "", requestLimit: "" },
    annualpayment: { amount: "", requestLimit: "" },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split("."); // e.g., "partialpayment.amount"

    setCustom((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value ? Number(value) : "",
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Merge basic + custom into one object
    const finalData = {
      ...initialFormData,
      custom,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/apiGen/createApi`,
        finalData,
        { withCredentials: true }
      );

      console.log("API Created:", res.data);
      navigate("/provider/providerApi"); // go back to list or dashboard
    } catch (err) {
      console.error(err);
      alert("Error creating API");
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-semibold text-white mb-2">
        Custom Pricing – {initialFormData.name}
      </h2>
      <p className="text-sm text-gray-300 mb-4">
        {initialFormData.categories} — {initialFormData.baseUrl}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Partial Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-200">
              Partial Amount (₹)
            </label>
            <input
              type="number"
              name="partialpayment.amount"
              value={custom.partialpayment.amount}
              onChange={handleChange}
              className="mt-1 px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 75"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-200">
              Partial Requests
            </label>
            <input
              type="number"
              name="partialpayment.requestLimit"
              value={custom.partialpayment.requestLimit}
              onChange={handleChange}
              className="mt-1 px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 20"
            />
          </div>
        </div>

        {/* Monthly Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-200">
              Monthly Amount (₹)
            </label>
            <input
              type="number"
              name="monthlypayment.amount"
              value={custom.monthlypayment.amount}
              onChange={handleChange}
              className="mt-1 px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 999"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-200">
              Monthly Requests
            </label>
            <input
              type="number"
              name="monthlypayment.requestLimit"
              value={custom.monthlypayment.requestLimit}
              onChange={handleChange}
              className="mt-1 px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 500"
            />
          </div>
        </div>

        {/* Annual Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-200">
              Annual Amount (₹)
            </label>
            <input
              type="number"
              name="annualpayment.amount"
              value={custom.annualpayment.amount}
              onChange={handleChange}
              className="mt-1 px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 9999"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-200">
              Annual Requests
            </label>
            <input
              type="number"
              name="annualpayment.requestLimit"
              value={custom.annualpayment.requestLimit}
              onChange={handleChange}
              className="mt-1 px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 12000"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            Create API
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPricingForm;