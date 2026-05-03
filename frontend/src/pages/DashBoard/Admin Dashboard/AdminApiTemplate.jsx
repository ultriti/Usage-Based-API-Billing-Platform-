// import React from "react";
// import { useState } from "react";

// const AdminApiTemplate = ({ api, onCopy, onDelete }) => {
//   return (
//     <div className="bg-gray-800 border border-2 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between text-white shadow-md mb-4">
//       {/* Left side details */}
//       <div className="flex flex-col gap-1">
//         <p className="text-lg font-semibold">{api.name}</p>
//         <p className="text-sm text-gray-300">total Requests: {api.billing.totalRequests}</p>
//         <p className="text-sm text-gray-300">
//            Revenue: ₹{api.billing?.amount}
//         </p>
//         <p className="text-sm text-gray-300">
//           Total Revenue: ₹{api.billing.totalAmount}
//         </p>
//         <p className="text-sm text-gray-300">
//           categories: {api.categories}
//         </p>
//         <p className="text-sm text-gray-300">
//           baseUrl: {api.baseUrl}
//         </p>
//         <p className="text-sm">
//           Status:{" "}
//           <span
//             className={`px-2 py-1 rounded text-xs ${
//               api.status === "active" ? "bg-green-600" : "bg-red-600"
//             }`}
//           >
//             {api.status}
//           </span>
//         </p>
//       </div>

//       {/* Right side actions */}
//       <div className="flex gap-2 mt-3 md:mt-0">
//         <button
//           onClick={() => onCopy(api.email)}
//           className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
//         >
//           Copy
//         </button>
//         <button
//           onClick={() => onDelete(api.id)}
//           className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdminApiTemplate;



import React from "react";

const InfoRow = ({ label, value, mono = false, full = false }) => (
  <div className={`grid ${full ? "md:col-span-2" : ""} grid-cols-[120px_1fr] gap-3`}>
    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span
      className={`text-sm text-slate-100 break-all ${
        mono ? "font-mono text-slate-200" : ""
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

const AdminApiTemplate = ({ api, onCopy, onDelete }) => {
  const isActive = api?.status === "active";

  return (
    <div className="group rounded-2xl z-500 border mb-5 border-slate-700 bg-slate-900/90 p-5 shadow-sm transition-all duration-200 hover:border-slate-600 hover:shadow-lg">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Left content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-white">
                {api?.name || "Unnamed API"}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Usage-based billing overview
              </p>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
              }`}
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${
                  isActive ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
              {api?.status || "unknown"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoRow
              label="Requests"
              value={api?.billing?.totalRequests?.toLocaleString?.() ?? "0"}
            />
            <InfoRow
              label="Current Revenue"
              value={`₹${api?.billing?.amount?.toLocaleString?.() ?? "0"}`}
            />
            <InfoRow
              label="Total Revenue"
              value={`₹${api?.billing?.totalAmount?.toLocaleString?.() ?? "0"}`}
            />
            <InfoRow
              label="Category"
              value={
                Array.isArray(api?.categories)
                  ? api.categories.join(", ")
                  : api?.categories
              }
            />
            <InfoRow
              label="Base URL"
              value={api?.baseUrl}
              mono
              full
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 flex-row gap-2 lg:flex-col lg:items-stretch">
          <button
            type="button"
            onClick={() => onCopy(api?.email)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Copy
          </button>

          <button
            type="button"
            onClick={() => onDelete(api?.id)}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminApiTemplate;