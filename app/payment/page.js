"use client";

import React from "react";

const PaymentPage = ({ templateId, amount, currency }) => {
  // এই link তুমি Payoneer dashboard থেকে generate করবে
  const payoneerLink =
    "https://payoneer.com/paylink?token=YOUR_GENERATED_TOKEN";

  const handlePaymentClick = () => {
    window.location.href = payoneerLink;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Purchase Template</h2>
        <p className="mb-6">
          Template ID: <strong>{templateId}</strong>
        </p>
        <p className="mb-6">
          Amount:{" "}
          <strong>
            {currency} {amount}
          </strong>
        </p>
        <button
          onClick={handlePaymentClick}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg"
        >
          Pay via Payoneer
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
