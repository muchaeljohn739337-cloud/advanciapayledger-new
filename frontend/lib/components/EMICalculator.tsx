'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(12);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  const calculateEMI = () => {
    const principal = loanAmount;
    const ratePerMonth = interestRate / 12 / 100;
    const numberOfMonths = tenure;

    if (ratePerMonth === 0) {
      const monthlyEMI = principal / numberOfMonths;
      setEmi(monthlyEMI);
      setTotalAmount(principal);
      setTotalInterest(0);
      return;
    }

    const emiValue =
      (principal * ratePerMonth * Math.pow(1 + ratePerMonth, numberOfMonths)) /
      (Math.pow(1 + ratePerMonth, numberOfMonths) - 1);

    const totalAmountValue = emiValue * numberOfMonths;
    const totalInterestValue = totalAmountValue - principal;

    setEmi(emiValue);
    setTotalAmount(totalAmountValue);
    setTotalInterest(totalInterestValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">EMI Calculator</h2>
          <p className="text-gray-400 text-sm">Calculate your monthly installments</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Loan Amount
            </label>
            <span className="text-white font-bold">{formatCurrency(loanAmount)}</span>
          </div>
          <input
            type="range"
            min="10000"
            max="10000000"
            step="10000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$10K</span>
            <span>$10M</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Interest Rate (% p.a.)
            </label>
            <span className="text-white font-bold">{interestRate.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Loan Tenure (Months)
            </label>
            <span className="text-white font-bold">{tenure} months</span>
          </div>
          <input
            type="range"
            min="6"
            max="360"
            step="6"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6 months</span>
            <span>30 years</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center"
        >
          <p className="text-blue-200 text-sm mb-2">Monthly EMI</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(emi)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center"
        >
          <p className="text-purple-200 text-sm mb-2">Total Interest</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalInterest)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center"
        >
          <p className="text-green-200 text-sm mb-2">Total Amount</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
        </motion.div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Principal Amount</span>
          <span className="text-white font-semibold">{formatCurrency(loanAmount)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Interest Component</span>
          <span className="text-white font-semibold">{formatCurrency(totalInterest)}</span>
        </div>
        <div className="mt-4 h-3 bg-gray-700 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${(loanAmount / totalAmount) * 100}%` }}
          />
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600"
            style={{ width: `${(totalInterest / totalAmount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
