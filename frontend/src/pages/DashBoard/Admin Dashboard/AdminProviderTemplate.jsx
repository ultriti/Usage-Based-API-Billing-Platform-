import React from "react";

const Field = ({ label, value, full = false, mono = false }) => (
  <div className={`${full ? "md:col-span-2" : ""} grid grid-cols-[130px_1fr] gap-3`}>
    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span
      className={`text-sm ${
        mono ? "font-mono text-slate-200 break-all" : "text-slate-100"
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

const StatusBadge = ({ children, color = "slate" }) => {
  const styles = {
    green: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    red: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
    yellow: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    blue: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
    slate: "bg-slate-700/40 text-slate-300 ring-1 ring-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[color]}`}
    >
      {children}
    </span>
  );
};

// const AdminProviderCard = ({ provider, onView, onDelete, onCopyEmail }) => {
//   const totalApis = provider?.apiCreated?.length || 0;
//   const emailVerified = provider?.isVerified?.email;
//   const phoneVerified = provider?.isVerified?.phone;
//   const isFreePlan = provider?.subscriptionPlan === "free";

//   return (
//     <div className="rounded-2xl border z-500 border-slate-700 bg-slate-900/90 p-5 shadow-sm transition-all duration-200 hover:border-slate-600 hover:shadow-lg">
//       <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">


//         {/* Left section */}
//         <div className="min-w-0 flex-1">
//           <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
//             <div className="min-w-0">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-base font-semibold text-white ring-1 ring-slate-700">
//                   {provider?.username?.charAt(0)?.toUpperCase() || "P"}
//                 </div>

//                 <div className="min-w-0">
//                   <h3 className="truncate text-lg font-semibold text-white">
//                     {provider?.username || "Unknown Provider"}
//                   </h3>
//                   <p className="truncate text-sm text-slate-400">
//                     {provider?.role || "provider"}
//                   </p>
//                 </div>
//               </div>


//               <div className="mt-3 flex flex-wrap gap-2">
//                 <StatusBadge color={emailVerified ? "green" : "red"}>
//                   {emailVerified ? "Email Verified" : "Email Not Verified"}
//                 </StatusBadge>

//                 <StatusBadge color={phoneVerified ? "green" : "yellow"}>
//                   {phoneVerified ? "Phone Verified" : "Phone Pending"}
//                 </StatusBadge>

//                 <StatusBadge color={isFreePlan ? "slate" : "blue"}>
//                   {provider?.subscriptionPlan || "No Plan"}
//                 </StatusBadge>

//                 <StatusBadge color={provider?.membership ? "blue" : "slate"}>
//                   {provider?.membership ? "Member" : "Non Member"}
//                 </StatusBadge>
//               </div>
//             </div>
//           </div>


//           <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
//             <Field label="Provider ID" value={provider?._id} mono />
//             <Field label="Email" value={provider?.email} />
//             <Field label="APIs Created" value={totalApis} />
//             <Field label="Subscription" value={provider?.subscriptionPlan || "—"} />
//             <Field
//               label="Created At"
//               value={
//                 provider?.createdAt
//                   ? new Date(provider.createdAt).toLocaleString()
//                   : "—"
//               }
//             />
//             <Field
//               label="Updated At"
//               value={
//                 provider?.updatedAt
//                   ? new Date(provider.updatedAt).toLocaleString()
//                   : "—"
//               }
//             />
//             <Field
//               label="Subscription Expires"
//               value={
//                 provider?.subscriptionExpires
//                   ? new Date(provider.subscriptionExpires).toLocaleDateString()
//                   : "No expiry"
//               }
//             />
//             <Field label="Profile Image" value={provider?.profilePicture?.url ? "Available" : "Not Added"} />
//           </div>
//         </div>

//         {/* Right actions */}
//         <div className="flex shrink-0 flex-row flex-wrap gap-2 xl:w-[170px] xl:flex-col">
//           <button
//             type="button"
//             onClick={() => onView?.(provider)}
//             className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
//           >
//             View
//           </button>

//           <button
//             type="button"
//             onClick={() => onCopyEmail?.(provider?.email)}
//             className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           >
//             Copy Email
//           </button>

//           <button
//             type="button"
//             onClick={() => onDelete?.(provider?._id)}
//             className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


const AdminProviderCard = ({ provider, onView, onDelete, onCopyEmail }) => {
  const totalApis = provider?.apis?.length || 0;
  const emailVerified = provider?.isVerified?.email;
  const phoneVerified = provider?.isVerified?.phone;
  const isFreePlan = provider?.subscriptionPlan === "free";

  // Calculate totals from apis
  let totalRequests = 0;
  let totalAmount = provider?.totalAmount || 0;
  let paidAmount = 0;
  let unpaidAmount = 0;

  provider?.apis?.forEach((api) => {
    totalRequests += api?.billing?.totalRequests || 0;

    // consumerDetail entries
    api?.billing?.consumerDetail?.forEach((bill) => {
      if (bill.status === "paid") {
        paidAmount += bill.ammountPaid || 0;
      } else {
        unpaidAmount += bill.ammountPaid || 0;
      }
    });
  });

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-sm transition-all duration-200 hover:border-slate-600 hover:shadow-lg">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        {
            console.log('provider',provider)
            
        }
        {/* Left section */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-base font-semibold text-white ring-1 ring-slate-700">
              {provider?.username?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-white">
                {provider?.username || "Unknown Provider"}
              </h3>
              <p className="truncate text-sm text-slate-400">
                {provider?.role || "provider"}
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge color={emailVerified ? "green" : "red"}>
              {emailVerified ? "Email Verified" : "Email Not Verified"}
            </StatusBadge>
            <StatusBadge color={phoneVerified ? "green" : "yellow"}>
              {phoneVerified ? "Phone Verified" : "Phone Pending"}
            </StatusBadge>
            <StatusBadge color={isFreePlan ? "slate" : "blue"}>
              {provider?.subscriptionPlan || "No Plan"}
            </StatusBadge>
            <StatusBadge color={provider?.membership ? "blue" : "slate"}>
              {provider?.membership ? "Member" : "Non Member"}
            </StatusBadge>
          </div>

          {/* Fields */}
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Provider ID" value={provider?._id} mono />
            <Field label="Email" value={provider?.email} />
            <Field label="APIs Created" value={totalApis} />
            <Field label="Total Requests" value={totalRequests} />
            <Field label="Total Amount" value={`₹${totalAmount}`} />
            <Field label="Paid Amount" value={`₹${paidAmount}`} />
            <Field label="Unpaid Amount" value={`₹${unpaidAmount}`} />
            <Field
              label="Created At"
              value={
                provider?.createdAt
                  ? new Date(provider.createdAt).toLocaleString()
                  : "—"
              }
            />
            <Field
              label="Updated At"
              value={
                provider?.updatedAt
                  ? new Date(provider.updatedAt).toLocaleString()
                  : "—"
              }
            />
            <Field
              label="Subscription Expires"
              value={
                provider?.subscriptionExpires
                  ? new Date(provider.subscriptionExpires).toLocaleDateString()
                  : "No expiry"
              }
            />
            <Field
              label="Profile Image"
              value={
                provider?.profilePicture?.url ? "Available" : "Not Added"
              }
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 flex-row flex-wrap gap-2 xl:w-[170px] xl:flex-col">
          <button
            type="button"
            onClick={() => onView?.(provider)}
            className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onCopyEmail?.(provider?.email)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Copy Email
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(provider?._id)}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


export default AdminProviderCard;