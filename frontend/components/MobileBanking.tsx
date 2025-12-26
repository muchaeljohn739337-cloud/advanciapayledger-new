"use client";

import React from 'react';

export default function MobileBanking() {
  const transactions = [
    { id: 1, type: 'Credit', amount: 5000, description: 'Salary Credit', date: '2025-12-24' },
    { id: 2, type: 'Debit', amount: 1200, description: 'Online Purchase', date: '2025-12-23' },
    { id: 3, type: 'Credit', amount: 2500, description: 'Transfer In', date: '2025-12-22' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex justify-between items-center p-3 border-l-4 border-gray-200 bg-gray-50">
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-gray-500">{transaction.date}</p>
            </div>
            <div className={ont-bold }>
              {transaction.type === 'Credit' ? '+' : '-'}₹{transaction.amount}
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
        View All Transactions
      </button>
    </div>
  );
}
