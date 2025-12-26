"use client";

import React from 'react';

export default function TradingChart() {
  const cryptoPrices = [
    { symbol: 'BTC', price: 42850, change: '+2.5%', color: 'text-green-600' },
    { symbol: 'ETH', price: 2650, change: '+1.8%', color: 'text-green-600' },
    { symbol: 'ADA', price: 0.85, change: '-0.5%', color: 'text-red-600' },
    { symbol: 'SOL', price: 125, change: '+4.2%', color: 'text-green-600' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Crypto Market</h3>
      
      <div className="space-y-3">
        {cryptoPrices.map((crypto) => (
          <div key={crypto.symbol} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {crypto.symbol.substring(0, 1)}
              </div>
              <div>
                <p className="font-medium">{crypto.symbol}</p>
                <p className="text-sm text-gray-500">Cryptocurrency</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">₹{crypto.price.toLocaleString()}</p>
              <p className={	ext-sm }>{crypto.change}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-md">
        <p className="text-sm text-gray-700">
          💡 <strong>Web3 Integration:</strong> Connect your wallet for live trading and DeFi features
        </p>
      </div>
    </div>
  );
}
