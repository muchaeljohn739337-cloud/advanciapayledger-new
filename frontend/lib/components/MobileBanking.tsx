"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Globe,
  Send,
  Shield,
  Smartphone,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending";
}

export default function MobileBanking() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");

  const transactions: Transaction[] = [
    {
      id: "1",
      type: "receive",
      amount: 2500.0,
      description: "Salary Deposit",
      date: "2 hours ago",
      status: "completed",
    },
    {
      id: "2",
      type: "send",
      amount: 150.5,
      description: "Online Shopping",
      date: "5 hours ago",
      status: "completed",
    },
    {
      id: "3",
      type: "send",
      amount: 85.0,
      description: "Restaurant Payment",
      date: "1 day ago",
      status: "completed",
    },
    {
      id: "4",
      type: "receive",
      amount: 500.0,
      description: "Freelance Project",
      date: "2 days ago",
      status: "completed",
    },
    {
      id: "5",
      type: "send",
      amount: 1200.0,
      description: "Rent Payment",
      date: "3 days ago",
      status: "pending",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Send money in seconds",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is encrypted",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Globe,
      title: "Global Payments",
      description: "Send money worldwide",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      title: "Smart Insights",
      description: "Track your spending",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Mobile Banking Hero */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Mobile Banking</h2>
              <p className="text-gray-400">Bank anywhere, anytime</p>
            </div>
          </div>

          <p className="text-gray-300 mb-8 text-lg">
            Experience seamless digital banking with our mobile app. Send money, pay bills, and
            manage your finances with just a few taps.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-3`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50">
              <Smartphone className="w-5 h-5" />
              Download App
            </button>
            <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-gray-700">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Side - Transaction Dashboard */}
        <div>
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-blue-100 text-sm">Total Balance</p>
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-6">$12,458.50</h3>

              <div className="flex gap-3">
                <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </button>
                <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Request
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === "transactions"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Transactions
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === "transactions" && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "receive" ? "bg-green-500/20" : "bg-red-500/20"
                          }`}
                        >
                          {transaction.type === "receive" ? (
                            <ArrowDownLeft
                              className={`w-5 h-5 ${
                                transaction.type === "receive" ? "text-green-400" : "text-red-400"
                              }`}
                            />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{transaction.description}</p>
                          <p className="text-gray-400 text-sm">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            transaction.type === "receive" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "receive" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Income</p>
                    <p className="text-2xl font-bold text-green-400">+$3,000</p>
                    <p className="text-gray-500 text-xs mt-1">This month</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Expenses</p>
                    <p className="text-2xl font-bold text-red-400">-$1,435</p>
                    <p className="text-gray-500 text-xs mt-1">This month</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-3">Spending Categories</p>
                  <div className="space-y-3">
                    {[
                      { name: "Shopping", amount: 450, percent: 31, color: "bg-blue-500" },
                      { name: "Food & Dining", amount: 285, percent: 20, color: "bg-purple-500" },
                      { name: "Transportation", amount: 200, percent: 14, color: "bg-green-500" },
                      { name: "Bills", amount: 500, percent: 35, color: "bg-orange-500" },
                    ].map((category) => (
                      <div key={category.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{category.name}</span>
                          <span className="text-white font-semibold">${category.amount}</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${category.color}`}
                            style={{ width: `${category.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
