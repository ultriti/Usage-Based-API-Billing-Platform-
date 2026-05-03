import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import TransactionTemplate from "./TransactionTemplate";

import NavbarFrame from "../../../../components/providerComponents/NavbarFrame";
import ProviderSidebarFrame from "../../../../components/providerComponents/ProviderSidebarFrame";
import "../ProviderDashboard.css"
import PageDecoration from "../../../../components/providerComponents/PageDecoration";



const TransactionFrame = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCustomerId, setSearchCustomerId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getTransactions = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL_RD}/api/transaction/transactions/provider`,
        { withCredentials: true },
      );

      if (response.status === 200) {
        setTransactions(response?.data?.transactions || []);
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
    getTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction?.consumerDetail?.customerId
          ?.toLowerCase()
          .includes(searchCustomerId.toLowerCase()) || false;

      const matchesStatus =
        statusFilter === "all" ||
        transaction?.status?.toLowerCase() === statusFilter ||
        transaction?.consumerDetail?.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchCustomerId, statusFilter]);

  const handleCopyRef = (ref) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    alert(`Copied: ${ref}`);
  };

  const totalTransactions = transactions.length;
  const pendingCount = transactions.filter(
    (t) => t?.status === "pending" || t?.consumerDetail?.status === "pending",
  ).length;
  const settlingCount = transactions.filter(
    (t) => t?.status === "settling",
  ).length;
  const paidCount = transactions.filter(
    (t) => t?.status === "paid" || t?.consumerDetail?.status === "paid",
  ).length;

  return (
    <div className="mt-4 flex min-h-[100vh] w-full flex-col overflow-hidden rounded-xl bg-gray-900">

      <PageDecoration/>
      {/* navbar */}
      <div className="userNavbarFrame">
        <NavbarFrame />
      </div>

      <div className="sidebarFrame">
        <ProviderSidebarFrame/>
      </div>

      <div className="providerMainFrame ">
        {/* Top filter bar */}
        <div className="flex w-full flex-col gap-3 rounded-md bg-gray-800 px-4 py-4 lg:flex-row lg:items-center">
          <input
            type="text"
            placeholder="Search by customer ID..."
            value={searchCustomerId}
            onChange={(e) => setSearchCustomerId(e.target.value)}
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
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 px-5 pt-5 md:grid-cols-4">
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Total Transactions</p>
            <h3 className="mt-2 text-2xl font-bold text-white">
              {totalTransactions}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <h3 className="mt-2 text-2xl font-bold text-white">
              {pendingCount}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Settling</p>
            <h3 className="mt-2 text-2xl font-bold text-white">
              {settlingCount}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Paid</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{paidCount}</h3>
          </div>
        </div>

        {/* Transaction list */}
        <div className="w-full px-5 py-5">
          {loading ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 text-center text-gray-400">
              Loading transactions...
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <TransactionTemplate
                  key={transaction?._id}
                  transaction={transaction}
                  onCopyRef={handleCopyRef}
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
    </div>
  );
};

export default TransactionFrame;
