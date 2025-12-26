"use client";

import { useEffect, useState } from "react";

interface ThreatAnalysis {
  riskScore: number;
  threatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: {
    suspiciousPattern: boolean;
    velocityRisk: boolean;
    ipRisk: boolean;
    deviceRisk: boolean;
  };
}

interface Anomaly {
  anomalyType: string;
  description: string;
  confidence: number;
}

export function AIThreatMonitor() {
  const [sessionRisk, setSessionRisk] = useState<ThreatAnalysis | null>(null);
  const [threatLevel, setThreatLevel] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("LOW");
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const analyzeSession = async () => {
    setLoading(true);
    try {
      // Mock AI analysis - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockAnalysis: ThreatAnalysis = {
        riskScore: Math.floor(Math.random() * 100),
        threatLevel: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)] as any,
        factors: {
          suspiciousPattern: Math.random() > 0.7,
          velocityRisk: Math.random() > 0.8,
          ipRisk: Math.random() > 0.9,
          deviceRisk: Math.random() > 0.85,
        },
      };

      const mockAnomalies: Anomaly[] = [
        {
          anomalyType: "Velocity Alert",
          description: "High frequency withdrawal attempts detected",
          confidence: 0.87,
        },
        {
          anomalyType: "Pattern Recognition",
          description: "Unusual access pattern from new location",
          confidence: 0.72,
        },
        {
          anomalyType: "Amount Analysis",
          description: "Withdrawal amount significantly higher than usual",
          confidence: 0.94,
        },
      ].filter(() => Math.random() > 0.3);

      setSessionRisk(mockAnalysis);
      setThreatLevel(mockAnalysis.threatLevel);
      setAnomalies(mockAnomalies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeSession();
    // Refresh every 30 seconds
    const interval = setInterval(analyzeSession, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          🤖 AI Threat Intelligence
        </h3>
        <button
          onClick={analyzeSession}
          disabled={loading}
          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {loading ? "🔄 Analyzing..." : "🔍 Refresh"}
        </button>
      </div>

      {/* Threat Level Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Current Threat Level
          </span>
          <span
            className={`px-3 py-1 text-xs font-bold text-white rounded-full ${getThreatColor(threatLevel)}`}
          >
            {threatLevel}
          </span>
        </div>

        {sessionRisk && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Risk Score</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {sessionRisk.riskScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getThreatColor(threatLevel)}`}
                style={{ width: `${sessionRisk.riskScore}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Risk Factors */}
      {sessionRisk && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🔍 Risk Factors
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(sessionRisk.factors).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  value
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200"
                    : "bg-green-50 dark:bg-green-900/20 border border-green-200"
                }`}
              >
                <span className={`text-xs ${value ? "❌" : "✅"}`}>{value ? "❌" : "✅"}</span>
                <span
                  className={`text-xs font-medium ${value ? "text-red-700" : "text-green-700"}`}
                >
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Monitoring */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          📡 Live Monitoring
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <span className="text-xs text-blue-700">🔄 AI Analysis Engine</span>
            <span className="text-xs text-blue-700 font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
            <span className="text-xs text-green-700">🛡️ Fraud Detection</span>
            <span className="text-xs text-green-700 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
            <span className="text-xs text-purple-700">⚡ Real-time Scoring</span>
            <span className="text-xs text-purple-700 font-bold">ENABLED</span>
          </div>
        </div>
      </div>

      {/* Recent Anomalies */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          🚨 Recent Anomalies ({anomalies.length})
        </h4>
        {anomalies.length === 0 ? (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 dark:text-green-300">✅ No anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase">
                    🔥 {anomaly.anomalyType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(anomaly.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{anomaly.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          🤖 AI Assistant
        </h4>
        <div className="space-y-2">
          <button className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <span className="text-xs text-blue-700">💡 Suggest optimal approval criteria</span>
          </button>
          <button className="w-full text-left p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <span className="text-xs text-purple-700">📊 Generate risk assessment report</span>
          </button>
          <button className="w-full text-left p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <span className="text-xs text-green-700">🎯 Auto-approve low-risk transactions</span>
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>AI systems operational • Last update: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
