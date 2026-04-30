import React from 'react'
import UserPayment_razorpay from "./UserPayment_razorpay";

const DemoPayment = () => {
  return (
     <div className="flex gap-6">
      <UserPayment_razorpay amount={5} />
      <UserPayment_razorpay amount={1} />
    </div>
  )
}

export default DemoPayment
