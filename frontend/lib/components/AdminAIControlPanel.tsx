'use client';
import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  aiEnabled: boolean;
  aiMonthlyLimit: number;
  monthlySpent: number;
  utilizationPercent: number;
}

interface Analytics {
  summary: {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    avgCostPerRequest: number;
  };
  topUsers: Array<{ userId: string; _sum: { costUsd: number } }>;
  modelUsage: Array<{ model: string; provider: string; _sum: { costUsd: number } }>;
  costByProvider: Array<{ provider: string; _sum: { costUsd: number } }>;
}

export function AdminAIControlPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      const [usersRes, analyticsRes, statusRes] = await Promise.all([
        fetch(${baseUrl}/api/admin/ai-control/users, {
          headers: { 'Authorization': Bearer  }
        }).then(r => r.json()),
        fetch(${baseUrl}/api/admin/ai-control/analytics, {
          headers: { 'Authorization': Bearer  }
        }).then(r => r.json()),
        fetch(${baseUrl}/api/admin/ai-control/status, {
          headers: { 'Authorization': Bearer  }
        }).then(r => r.json())
      ]);
      
      if (usersRes.success) setUsers(usersRes.users);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (statusRes.success) setStatus(statusRes.status);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAI = async (userId: string, enabled: boolean) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(${baseUrl}/api/admin/ai-control/users/, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Bearer 
        },
        body: JSON.stringify({ aiEnabled: enabled })
      });
      
      if (response.ok) {
        alert(AI  for user);
        loadData();
      }
    } catch (error) {
      alert('Failed to update user AI access');
    }
  };

  const emergencyStop = async () => {
    if (confirm('🚨 This will disable AI globally for all users. Continue?')) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(${baseUrl}/api/admin/ai-control/emergency-stop, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': Bearer 
          },
          body: JSON.stringify({ reason: 'Manual admin emergency stop' })
        });
        
        if (response.ok) {
          alert('🚨 AI GLOBALLY DISABLED');
          loadData();
        }
      } catch (error) {
        alert('Emergency stop failed');
      }
    }
  };

  const enableAI = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(${baseUrl}/api/admin/ai-control/enable, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Bearer 
        }
      });
      
      if (response.ok) {
        alert('✅ AI GLOBALLY ENABLED');
        loadData();
      }
    } catch (error) {
      alert('Failed to enable AI');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">🤖 Loading AI Control Center...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 AI Control Center</h1>
          <p className="text-gray-600 mt-1">Enterprise AI Management Dashboard</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={enableAI}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            ✅ Enable AI
          </button>
          <button
            onClick={emergencyStop}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            🚨 Emergency Stop
          </button>
        </div>
      </div>

      {/* Status Summary */}
      {status && (
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={	ext-3xl mb-2 }>
                {status.globallyEnabled ? '✅' : '❌'}
              </div>
              <p className="text-sm font-medium text-gray-700">AI Status</p>
              <p className="text-xs text-gray-500">{status.globallyEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-blue-500 mb-2">🔑</div>
              <p className="text-sm font-medium text-gray-700">API Keys</p>
              <p className="text-xs text-gray-500">
                {Object.values(status.apiKeys || {}).filter(Boolean).length}/3 Active
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-purple-500 mb-2">��</div>
              <p className="text-sm font-medium text-gray-700">Total Users</p>
              <p className="text-xs text-gray-500">{status.totalUsers}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl text-orange-500 mb-2">⚡</div>
              <p className="text-sm font-medium text-gray-700">Active Users</p>
              <p className="text-xs text-gray-500">{status.activeUsers}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
            <p className="text-2xl font-bold text-green-600">
              
            </p>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <p className="text-2xl font-bold text-blue-600">
              {analytics.summary.totalRequests.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">API calls made</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Avg Cost/Request</h3>
            <p className="text-2xl font-bold text-purple-600">
              
            </p>
            <p className="text-xs text-gray-500">Per API call</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Tokens</h3>
            <p className="text-2xl font-bold text-orange-600">
              {analytics.summary.totalTokens.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Processed</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['dashboard', 'users', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={py-2 px-1 border-b-2 font-medium text-sm capitalize }
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">👥 User AI Management</h2>
            <p className="text-sm text-gray-600">Control AI access and spending limits for individual users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email || user.username}
                      </div>
                      <div className="text-sm text-gray-500">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={inline-flex px-2 py-1 text-xs font-semibold rounded-full }>
                        {user.aiEnabled ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                         ({user.utilizationPercent.toFixed(1)}%)
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: ${Math.min(user.utilizationPercent, 100)}% }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleUserAI(user.id, !user.aiEnabled)}
                        className={px-3 py-1 rounded text-white text-xs }
                      >
                        {user.aiEnabled ? '🚫 Disable' : '✅ Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">💰 Top Spending Users</h3>
            <div className="space-y-3">
              {analytics.topUsers.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">#{index + 1} {user.userId.slice(0, 8)}...</span>
                  <span className="font-semibold text-green-600"></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">🤖 Model Usage</h3>
            <div className="space-y-3">
              {analytics.modelUsage.map((model, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{model.model}</span>
                    <span className="text-xs text-gray-500 ml-2">({model.provider})</span>
                  </div>
                  <span className="font-semibold text-blue-600"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">🎛️ AI Control Dashboard</h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Enterprise AI Control System Active</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your unified AI control system is operational. Monitor user activity, manage spending limits, 
              and maintain enterprise-grade control over all AI operations.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button 
                onClick={() => setActiveTab('users')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Manage Users
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
