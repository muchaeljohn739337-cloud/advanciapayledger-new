"use client";

import RequireRole from "@/components/RequireRole";
import { AIThreatMonitor } from "@/components/ai/AISecurityWidgets";
import { adminApi } from "@/utils/api";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface WithdrawalAnalytics {
  totalPending: number;
  highRiskCount: number;
  totalValueUSD: number;
  avgProcessingTime: number;
  approvalRate: number;
  topCurrency: string;
}

interface AIAnalysis {
  riskScore: number;
  recommendation: "APPROVE" | "REJECT" | "REVIEW";
  factors: string[];
  confidence: number;
  velocityCheck: {
    recent24h: number;
    recent7d: number;
    isHighVelocity: boolean;
  };
}

interface WithdrawalRequest {
  id: string;
  user: {
    id: string;
    email: string;
    username: string;
    tier: string;
    kycStatus: string;
    accountAge: number;
  };
  cryptoType: string;
  cryptoAmount: string;
  usdEquivalent: string;
  withdrawalAddress: string;
  status: string;
  adminNotes?: string;
  txHash?: string;
  networkFee?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  aiAnalysis?: AIAnalysis;
}

export default function EnhancedWithdrawalConsole() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [analytics, setAnalytics] = useState<WithdrawalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [networkFee, setNetworkFee] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  const fetchWithdrawals = React.useCallback(async () => {
    try {
      setLoading(true);
      const url = filterStatus
        ? `/crypto/admin/pending-with-ai?status=${filterStatus}`
        : "/crypto/admin/pending-with-ai";
      const response: any = await adminApi.get(url);

      if (response.data && Array.isArray(response.data.withdrawals)) {
        setWithdrawals(response.data.withdrawals);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const response: any = await adminApi.get("/crypto/admin/ai-dashboard");
      if (response.data && response.data.analytics) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, []);

  useEffect(() => {
    void fetchWithdrawals();
    void fetchAnalytics();
  }, [fetchWithdrawals, fetchAnalytics]);

  const handleAction = async (withdrawalId: string, action: "approve" | "reject") => {
    if (!actionNotes && action === "reject") {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (action === "approve" && !txHash) {
      toast.error("Please provide transaction hash for approval");
      return;
    }

    setProcessing(true);

    try {
      const endpoint = `/crypto/admin/withdrawals/${withdrawalId}/${action}`;
      const payload: any = {
        adminNotes: actionNotes || undefined,
      };

      if (action === "approve") {
        payload.txHash = txHash;
        if (networkFee) payload.networkFee = parseFloat(networkFee);
      } else {
        payload.reason = actionNotes;
      }

      const response: any = await adminApi.post(endpoint, payload);

      if (response.data) {
        toast.success(
          action === "approve"
            ? "✅ Withdrawal approved successfully"
            : "⚠️ Withdrawal rejected and balance refunded"
        );
        setSelectedWithdrawal(null);
        setActionNotes("");
        setTxHash("");
        setNetworkFee("");
        fetchWithdrawals();
        fetchAnalytics();
      }
    } catch (error: unknown) {
      console.error("Error processing withdrawal:", error);
      let errorMessage = "Failed to process withdrawal";
      if (error && typeof error === "object" && "response" in error) {
        const responseError = error as { response?: { data?: { error?: string } } };
        errorMessage = responseError.response?.data?.error || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApproval = async () => {
    if (bulkSelected.size === 0) {
      toast.error("Please select withdrawals to approve");
      return;
    }

    setProcessing(true);
    try {
      const response: any = await adminApi.post("/crypto/admin/bulk-approve", {
        withdrawalIds: Array.from(bulkSelected),
      });

      if (response.data && response.data.results) {
        const successful = response.data.results.filter((r: any) => r.success).length;
        toast.success(`✅ Successfully approved ${successful}/${bulkSelected.size} withdrawals`);
        setBulkSelected(new Set());
        fetchWithdrawals();
        fetchAnalytics();
      }
    } catch (error) {
      console.error("Error in bulk approval:", error);
      toast.error("Failed to process bulk approval");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const getRiskBadge = (aiAnalysis?: AIAnalysis) => {
    if (!aiAnalysis)
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
          No Analysis
        </span>
      );

    const { riskScore } = aiAnalysis;
    if (riskScore <= 30) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          Low Risk ({riskScore})
        </span>
      );
    } else if (riskScore <= 60) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
          Medium Risk ({riskScore})
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
          High Risk ({riskScore})
        </span>
      );
    }
  };

  const getRecommendationBadge = (recommendation?: string) => {
    if (!recommendation) return null;

    const config = {
      APPROVE: { color: "bg-green-100 text-green-800", icon: "✅" },
      REJECT: { color: "bg-red-100 text-red-800", icon: "❌" },
      REVIEW: { color: "bg-yellow-100 text-yellow-800", icon: "👁️" },
    };

    const rec = config[recommendation as keyof typeof config] || config.REVIEW;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${rec.color}`}
      >
        {rec.icon} {recommendation}
      </span>
    );
  };

  return (
    <RequireRole roles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">🤖 Enhanced AI Withdrawal Console</h1>
                <p className="text-white/80 mt-2">
                  AI-powered withdrawal management with real-time risk analysis and automated
                  decision support
                </p>
              </div>
              <div className="text-white text-right">
                <p className="text-sm opacity-80">Live AI Analysis</p>
                <p className="text-2xl font-bold">{analytics?.totalPending || 0} Pending</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Analytics Dashboard */}
              {analytics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Analytics Dashboard</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{analytics.totalPending}</p>
                      <p className="text-sm text-blue-600">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{analytics.highRiskCount}</p>
                      <p className="text-sm text-red-600">High Risk</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{analytics.approvalRate}%</p>
                      <p className="text-sm text-green-600">Approval Rate</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        ${analytics.totalValueUSD}
                      </p>
                      <p className="text-sm text-purple-600">Total Value</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {analytics.avgProcessingTime}h
                      </p>
                      <p className="text-sm text-orange-600">Avg Time</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Filter Tabs */}
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {["all", "pending", "completed", "rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status === "all" ? "" : status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        filterStatus === (status === "all" ? "" : status)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Actions */}
              {bulkSelected.size > 0 && (
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {bulkSelected.size} withdrawal(s) selected
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkApproval}
                        disabled={processing}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {processing ? "Processing..." : "Bulk Approve"}
                      </button>
                      <button
                        onClick={() => setBulkSelected(new Set())}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Withdrawals List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <p className="text-gray-500 text-lg">
                    No {filterStatus || ""} withdrawal requests found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <motion.div
                      key={withdrawal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-l-blue-500"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {withdrawal.status === "pending" && (
                              <input
                                type="checkbox"
                                checked={bulkSelected.has(withdrawal.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(bulkSelected);
                                  if (e.target.checked) {
                                    newSelected.add(withdrawal.id);
                                  } else {
                                    newSelected.delete(withdrawal.id);
                                  }
                                  setBulkSelected(newSelected);
                                }}
                                className="w-4 h-4 text-indigo-600"
                              />
                            )}
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {withdrawal.user.email}
                              </h3>
                              <p className="text-sm text-gray-500">
                                @{withdrawal.user.username} • {withdrawal.user.tier} • KYC:{" "}
                                {withdrawal.user.kycStatus}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(withdrawal.status)}
                            {getRiskBadge(withdrawal.aiAnalysis)}
                          </div>
                        </div>

                        {/* AI Analysis Bar */}
                        {withdrawal.aiAnalysis && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex gap-2">
                                {getRecommendationBadge(withdrawal.aiAnalysis.recommendation)}
                                <span className="text-xs text-gray-600">
                                  Confidence: {(withdrawal.aiAnalysis.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              {withdrawal.aiAnalysis.velocityCheck.isHighVelocity && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  🚨 High Velocity
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-700">
                              <p>
                                <strong>Risk Factors:</strong>{" "}
                                {withdrawal.aiAnalysis.factors.join(", ")}
                              </p>
                              <p>
                                <strong>Recent Activity:</strong>{" "}
                                {withdrawal.aiAnalysis.velocityCheck.recent24h} withdrawals (24h),{" "}
                                {withdrawal.aiAnalysis.velocityCheck.recent7d} withdrawals (7d)
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Amount</p>
                            <p className="text-lg font-bold text-gray-900">
                              {parseFloat(withdrawal.cryptoAmount).toFixed(
                                withdrawal.cryptoType === "BTC"
                                  ? 8
                                  : withdrawal.cryptoType === "ETH"
                                    ? 6
                                    : 2
                              )}{" "}
                              {withdrawal.cryptoType}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">USD Equivalent</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${parseFloat(withdrawal.usdEquivalent).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Requested At</p>
                            <p className="text-sm text-gray-900">
                              {formatDate(withdrawal.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Account Age</p>
                            <p className="text-sm text-gray-900">
                              {withdrawal.user.accountAge} days
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase mb-1">Withdrawal Address</p>
                          <p className="text-xs text-gray-900 font-mono break-all bg-gray-50 p-2 rounded">
                            {withdrawal.withdrawalAddress || "—"}
                          </p>
                        </div>

                        {withdrawal.txHash && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase mb-1">Transaction Hash</p>
                            <p className="text-sm text-gray-900 font-mono break-all bg-gray-50 p-2 rounded">
                              {withdrawal.txHash}
                            </p>
                          </div>
                        )}

                        {withdrawal.adminNotes && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 uppercase mb-1">Admin Notes</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {withdrawal.adminNotes}
                            </p>
                          </div>
                        )}

                        {withdrawal.status === "pending" && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {selectedWithdrawal === withdrawal.id ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={actionNotes}
                                  onChange={(e) => setActionNotes(e.target.value)}
                                  placeholder="Admin notes (required for rejection)"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                  type="text"
                                  value={txHash}
                                  onChange={(e) => setTxHash(e.target.value)}
                                  placeholder="Transaction hash (required for approval)"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                  type="number"
                                  step="any"
                                  value={networkFee}
                                  onChange={(e) => setNetworkFee(e.target.value)}
                                  placeholder="Network fee (optional)"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAction(withdrawal.id, "approve")}
                                    disabled={processing}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    {processing ? "Processing..." : "✅ Approve"}
                                  </button>
                                  <button
                                    onClick={() => handleAction(withdrawal.id, "reject")}
                                    disabled={processing}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                                  >
                                    {processing ? "Processing..." : "❌ Reject & Refund"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedWithdrawal(null);
                                      setActionNotes("");
                                      setTxHash("");
                                      setNetworkFee("");
                                    }}
                                    className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedWithdrawal(withdrawal.id)}
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                              >
                                🔧 Process Withdrawal
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Sidebar */}
            <div className="lg:col-span-1">
              <AIThreatMonitor />
            </div>
          </div>
        </motion.div>
      </div>
    </RequireRole>
  );
}
