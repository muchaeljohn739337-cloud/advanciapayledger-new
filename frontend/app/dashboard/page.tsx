"use client";

import EMICalculator from "@/components/EMICalculator";
import MobileBanking from "@/components/MobileBanking";
import TradingChart from "@/components/TradingChart";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Balance",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: Wallet,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Revenue",
      value: "$12,234.00",
      change: "+15.3%",
      trend: "up",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Cards",
      value: "3",
      change: "+2 new",
      trend: "up",
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Transactions",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: Activity,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back! Here's your financial overview</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === "up" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Trading Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <TradingChart />
        </motion.div>

        {/* Mobile Banking & EMI Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MobileBanking />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <EMICalculator />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Send Money", icon: DollarSign, color: "from-blue-500 to-cyan-500" },
              { label: "Request Payment", icon: Wallet, color: "from-purple-500 to-pink-500" },
              { label: "View Cards", icon: CreditCard, color: "from-green-500 to-emerald-500" },
              { label: "Invite Friends", icon: Users, color: "from-orange-500 to-red-500" },
            ].map((action) => (
              <button
                key={action.label}
                className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all group"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-semibold text-sm">{action.label}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
