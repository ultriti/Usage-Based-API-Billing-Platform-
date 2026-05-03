import React from "react";

const StatusBadge = ({ status }) => {
  const map = {
    pending: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    settling: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
    paid: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        map[status] || "bg-slate-700/40 text-slate-300 ring-1 ring-slate-600"
      }`}
    >
      {status || "unknown"}
    </span>
  );
};

const Field = ({ label, value, mono = false, full = false }) => (
  <div className={`${full ? "md:col-span-2" : ""} grid grid-cols-[130px_1fr] gap-3`}>
    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className={`text-sm ${mono ? "font-mono text-slate-200 break-all" : "text-slate-100"}`}>
      {value || "—"}
    </span>
  </div>
);

const AdminTransactionTemplate = ({ transaction, onView, onCopy, onDelete }) => {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-600 hover:shadow-lg">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              {transaction?.apiId?.name || "Unnamed API"}
            </h3>
            <StatusBadge status={transaction?.status} />
            <StatusBadge status={transaction?.consumerDetail?.status} />
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Ref: {transaction?.transactionRef || "—"}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Transaction ID" value={transaction?._id} mono />
            <Field label="Provider ID" value={transaction?.providerId?._id} mono />
            <Field label="Provider Name" value={transaction?.providerId?.username} />
            <Field label="Provider Email" value={transaction?.providerId?.email} />
            <Field label="API ID" value={transaction?.apiId?._id} mono />
            <Field label="API Name" value={transaction?.apiId?.name} />
            <Field label="Amount" value={`${transaction?.currency || "INR"} ${transaction?.amount ?? 0}`} />
            <Field label="Payment Method" value={transaction?.paymentMethod} />
            <Field
              label="Invoice Date"
              value={
                transaction?.invoiceDate
                  ? new Date(transaction.invoiceDate).toLocaleString()
                  : "—"
              }
            />
            <Field
              label="Created At"
              value={
                transaction?.createdAt
                  ? new Date(transaction.createdAt).toLocaleString()
                  : "—"
              }
            />
            <Field label="Consumer Paid" value={transaction?.consumerDetail?.ammountPaid ?? 0} />
            <Field label="Consumer Status" value={transaction?.consumerDetail?.status} />
          </div>
        </div>

        <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
          <button
            type="button"
            onClick={() => onView?.(transaction)}
            className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            View
          </button>

          <button
            type="button"
            onClick={() => onCopy?.(transaction?.providerId?._id)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Copy Provider ID
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(transaction?._id)}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionTemplate;