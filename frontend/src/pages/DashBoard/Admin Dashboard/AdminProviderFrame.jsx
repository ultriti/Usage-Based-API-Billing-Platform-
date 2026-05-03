import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminProviderCard from "./AdminProviderTemplate";

const AdminProviderFrame = () => {
  const [providers, setProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [loading, setLoading] = useState(false);

  const getAdminProviderList = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/admin/getAllProviders`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const fetchedProviders = response?.data?.providers || [];
        setProviders(fetchedProviders);
        setAllProviders(fetchedProviders);
      } else {
        alert("Error fetching providers");
      }
    } catch (error) {
      console.error("Provider fetch error:", error);
      alert("Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminProviderList();
  }, []);

  const filteredProviders = useMemo(() => {
    return allProviders.filter((provider) => {
      const matchesSearch =
        provider?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlan =
        filterPlan === "all"
          ? true
          : provider?.subscriptionPlan?.toLowerCase() === filterPlan.toLowerCase();

      return matchesSearch && matchesPlan;
    });
  }, [allProviders, searchTerm, filterPlan]);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    alert(`Copied: ${email}`);
  };

  const handleDelete = (id) => {
    const updatedProviders = allProviders.filter((provider) => provider._id !== id);
    setAllProviders(updatedProviders);
    setProviders(updatedProviders);
  };

  const handleView = (provider) => {
    console.log("View provider:", provider);
  };

  return (
    <div className="mt-4 flex min-h-[92vh] w-full flex-col overflow-hidden rounded-xl bg-gray-900">
      {/* Top filter bar */}
      <div className="flex min-h-[10vh] w-full flex-col gap-3 rounded-md bg-gray-800 px-4 py-4 md:flex-row md:items-center">
        <input
          type="text"
          placeholder="Search provider by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          onClick={() => {}}
        >
          Search
        </button>

        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 px-5 pt-5 md:grid-cols-3">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Providers</p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            {allProviders.length}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Filtered Results</p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            {filteredProviders.length}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Verified Emails</p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            {allProviders.filter((p) => p?.isVerified?.email).length}
          </h3>
        </div>
      </div>

      {/* Providers list */}
      <div className="w-full gap-4 px-5 py-5 z-500">

        {loading ? (

          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
            Loading providers...
          </div>

        ) : filteredProviders.length > 0 ? (
          <div className="space-y-4 z-500">
            {filteredProviders.map((provider) => (
              <AdminProviderCard
                key={provider._id}
                provider={provider}
                onView={handleView}
                onDelete={handleDelete}
                onCopyEmail={handleCopyEmail}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
            No providers found.
          </div>
        )}

        
      </div>
    </div>
  );
};

export default AdminProviderFrame;