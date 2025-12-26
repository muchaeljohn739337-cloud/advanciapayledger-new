"use client";

import { useState } from "react";
import { Calculator, DollarSign, Calendar, Percent } from "lucide-react";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(12);

  // Calculate EMI using the formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
  const calculateEMI = () => {
    const principal = loanAmount;
    const ratePerMonth = interestRate / 12 / 100;
    const numberOfMonths = loanTenure;

    if (ratePerMonth === 0) {
      return principal / numberOfMonths;
    }

    const emi =
      (principal *
        ratePerMonth *
        Math.pow(1 + ratePerMonth, numberOfMonths)) /
      (Math.pow(1 + ratePerMonth, numberOfMonths) - 1);

    return emi;
  };

  const emi = calculateEMI();
  const totalAmount = emi * loanTenure;
  const totalInterest = totalAmount - loanAmount;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">EMI Calculator</h3>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Loan Amount
            </label>
            <span className="text-white font-semibold">
              ${loanAmount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Interest Rate (p.a.)
            </label>
            <span className="text-white font-semibold">{interestRate}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Loan Tenure */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-400 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Loan Tenure
            </label>
            <span className="text-white font-semibold">{loanTenure} months</span>
          </div>
          <input
            type="range"
            min="6"
            max="360"
            step="6"
            value={loanTenure}
            onChange={(e) => setLoanTenure(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Results */}
        <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Monthly EMI</span>
            <span className="text-2xl font-bold text-white">
              ${emi.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Interest</span>
            <span className="text-orange-400 font-semibold">
              ${totalInterest.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Amount</span>
            <span className="text-green-400 font-semibold">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      </div>
  );
}
