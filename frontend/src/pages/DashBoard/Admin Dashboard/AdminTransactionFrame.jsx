import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminTransactionTemplate from "./AdminTransactionTemplate";

const AdminTransactionFrame = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchProviderId, setSearchProviderId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/transaction/transactions`,
        { withCredentials: true }
      );

      if (res.status === 200) {
        setTransactions(res?.data?.transactions || []);
      } else {
        alert("Error fetching transactions");
      }
    } catch (error) {
      console.error("Transaction fetch error:", error);
      alert("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const providerId = tx?.providerId?._id || tx?.providerId || "";
      const matchesProvider = providerId
        .toLowerCase()
        .includes(searchProviderId.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || tx?.status?.toLowerCase() === statusFilter;

      return matchesProvider && matchesStatus;
    });
  }, [transactions, searchProviderId, statusFilter]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx._id !== id));
  };

  const handleView = (transaction) => {
    console.log("View transaction:", transaction);
  };

  const resetFilters = () => {
    setSearchProviderId("");
    setStatusFilter("all");
  };

  const totalTx = transactions.length;
  const pendingTx = transactions.filter((t) => t?.status === "pending").length;
  const settlingTx = transactions.filter((t) => t?.status === "settling").length;
  const paidTx = transactions.filter((t) => t?.consumerDetail?.status === "paid").length;

  return (
    <div className="mt-[2vw] flex min-h-[92vh] w-full flex-col overflow-hidden bg-gray-900">
      <div className="flex w-full flex-col gap-3 rounded-md bg-gray-800 px-4 py-4 lg:flex-row lg:items-center">
        <input
          type="text"
          placeholder="Search by provider ID..."
          value={searchProviderId}
          onChange={(e) => setSearchProviderId(e.target.value)}
          className="flex-1 rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="settling">Settling</option>
          <option value="paid">Paid</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 pt-5 md:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Transactions</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{totalTx}</h3>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Pending</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{pendingTx}</h3>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Settling</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{settlingTx}</h3>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-sm text-gray-400">Paid</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{paidTx}</h3>
        </div>
      </div>

      <div className="w-full px-5 py-5">
        {loading ? (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
            Loading transactions...
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <AdminTransactionTemplate
                key={transaction?._id}
                transaction={transaction}
                onView={handleView}
                onCopy={handleCopy}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactionFrame;