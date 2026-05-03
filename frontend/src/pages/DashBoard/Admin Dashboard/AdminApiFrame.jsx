import React, { useEffect, useMemo, useState } from "react";
import AdminApiTemplate from "./AdminApiTemplate";
import axios from "axios";

const AdminApiFrame = () => {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt-desc");

  const getAdminApiList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/admin/getAllApis`,
        { withCredentials: true }
      );

      if (res.status === 200) {
        setApis(res.data.apis || []);
      } else {
        alert("Error fetching APIs");
      }
    } catch (error) {
      console.error("API fetch error:", error);
      alert("Failed to fetch APIs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminApiList();
  }, []);

  const providerOptions = useMemo(() => {
    return [...new Set(apis.map((api) => api.providerId).filter(Boolean))];
  }, [apis]);

  const filteredApis = useMemo(() => {
    let result = [...apis];

    result = result.filter((api) => {
      const searchValue = [
        api?.name,
        api?.description,
        api?.baseUrl,
        api?.platformUrl,
        api?.providerId,
        api?.categories,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchValue.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || api?.status?.toLowerCase() === statusFilter;
      const matchesBilling =
        billingFilter === "all" ||
        api?.billing?.status?.toLowerCase() === billingFilter;
      const matchesProvider =
        providerFilter === "all" || api?.providerId === providerFilter;

      return matchesSearch && matchesStatus && matchesBilling && matchesProvider;
    });

    result.sort((a, b) => {
      const [field, direction] = sortBy.split("-");
      const dir = direction === "asc" ? 1 : -1;

      if (field === "createdAt") {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
        );
      }

      if (field === "totalRequests") {
        return ((a?.billing?.totalRequests || 0) - (b?.billing?.totalRequests || 0)) * dir;
      }

      if (field === "totalAmount") {
        return ((a?.billing?.totalAmount || 0) - (b?.billing?.totalAmount || 0)) * dir;
      }

      return 0;
    });

    return result;
  }, [apis, searchTerm, statusFilter, billingFilter, providerFilter, sortBy]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const handleDelete = (id) => {
    setApis((prev) => prev.filter((api) => api._id !== id));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBillingFilter("all");
    setProviderFilter("all");
    setSortBy("createdAt-desc");
  };

  const totalApis = apis.length;
  const activeApis = apis.filter((api) => api?.status === "active").length;
  const pendingBilling = apis.filter((api) => api?.billing?.status === "pending").length;
  const totalRequests = apis.reduce(
    (sum, api) => sum + (api?.billing?.totalRequests || 0),
    0
  );

  return (
    <div className="mt-4 flex min-h-[92vh] w-full flex-col overflow-hidden rounded-xl bg-gray-900">
      {/* Filter bar */}
      <div className="flex w-full flex-col gap-3 rounded-md bg-gray-800 px-4 py-[3vw] lg:flex-row lg:items-center">
        <input
          type="text"
          placeholder="Search by name, URL, provider, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={billingFilter}
          onChange={(e) => setBillingFilter(e.target.value)}
          className="rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Billing</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Providers</option>
          {providerOptions.map((providerId) => (
            <option key={providerId} value={providerId}>
              {providerId}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="totalRequests-desc">Most Requests</option>
          <option value="totalRequests-asc">Least Requests</option>
          <option value="totalAmount-desc">Highest Amount</option>
          <option value="totalAmount-asc">Lowest Amount</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
        >
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 px-5 pt-5 md:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Total APIs</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{totalApis}</h3>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Active APIs</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{activeApis}</h3>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Pending Billing</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{pendingBilling}</h3>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Requests</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{totalRequests}</h3>
        </div>
      </div>

      {/* List */}
      <div className="w-full px-5 py-5">
        {loading ? (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
            Loading APIs...
          </div>
        ) : filteredApis.length > 0 ? (
          <div className="space-y-4">
            {filteredApis.map((api) => (
              <AdminApiTemplate
                key={api?._id}
                api={api}
                onCopy={handleCopy}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
            No APIs found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApiFrame;
