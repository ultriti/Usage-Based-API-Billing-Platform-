import React from "react";

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    settling: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
    paid: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] || "bg-slate-700/40 text-slate-300 ring-1 ring-slate-600"
      }`}
    >
      {status || "unknown"}
    </span>
  );
};

const InfoRow = ({ label, value, mono = false }) => (
  <div className="grid grid-cols-[120px_1fr] gap-3">
    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className={`text-sm ${mono ? "font-mono break-all text-slate-200" : "text-slate-100"}`}>
      {value || "—"}
    </span>
  </div>
);

const TransactionTemplate = ({ transaction, onCopyRef }) => {
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
            Payment transaction details
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoRow
              label="Amount"
              value={`${transaction?.currency || "INR"} ${transaction?.amount ?? 0}`}
            />
            <InfoRow
              label="Method"
              value={transaction?.paymentMethod}
            />
            <InfoRow
              label="Customer ID"
              value={transaction?.consumerDetail?.customerId}
              mono
            />
            <InfoRow
              label="Paid Amount"
              value={`${transaction?.currency || "INR"} ${transaction?.consumerDetail?.ammountPaid ?? 0}`}
            />
            <InfoRow
              label="Invoice Date"
              value={
                transaction?.invoiceDate
                  ? new Date(transaction.invoiceDate).toLocaleString()
                  : "—"
              }
            />
            <InfoRow
              label="Reference"
              value={transaction?.transactionRef}
              mono
            />
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onCopyRef?.(transaction?.transactionRef)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Copy Ref
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTemplate;