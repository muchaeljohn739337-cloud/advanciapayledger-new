'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { useSocket } from '@/lib/socket';
import NotificationBell from '@/components/NotificationBell';

interface UserData {
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  balance: number;
  cryptoBalance: number;
  trustScore: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  description: string;
  provider: string;
  createdAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    loadUserData();
    loadTransactions();
    setupRealtimeUpdates();

    return () => {
      socket.off('balance_update');
      socket.off('transaction_update');
    };
  }, []);

  const setupRealtimeUpdates = () => {
    // Connect to Socket.IO for real-time updates
    socket.connect();

    socket.on('balance_update', (data: any) => {
      console.log('Balance updated:', data);
      if (user) {
        setUser(prev => prev ? {
          ...prev,
          balance: data.balance || prev.balance,
          cryptoBalance: data.cryptoBalance || prev.cryptoBalance
        } : null);
      }
    });

    socket.on('transaction_update', (data: any) => {
      console.log('Transaction updated:', data);
      // Reload transactions to get the latest data
      loadTransactions();
    });
  };

  const loadUserData = async () => {
    try {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Fetch real user data from API
      const response = await authService.fetchWithAuth('/api/dashboard/stats');
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          router.push('/login');
          return;
        }
        throw new Error('Failed to load user data');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      authService.logout();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await authService.fetchWithAuth('/api/dashboard/transactions?page=1&limit=10');
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadTransactions()]);
    setRefreshing(false);
  };

  const formatAmount = (amount: string | number, currency: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (currency === 'USD') {
      return `$${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${numAmount.toFixed(8)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (status: string, type: string) => {
    if (status === 'COMPLETED') {
      return type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600';
    }
    if (status === 'PENDING') return 'text-yellow-600';
    if (status === 'FAILED') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Advancia Pay</h1>
                <p className="text-gray-600 text-sm">Welcome back, {user?.firstName || 'User'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-semibold disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={() => authService.logout()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-blue-200 text-sm font-medium mb-2">Fiat Balance</p>
              <p className="text-4xl font-bold mb-2">${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center text-blue-100 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Available for withdrawal</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-orange-200 text-sm font-medium mb-2">Crypto Balance</p>
              <p className="text-4xl font-bold mb-2">${(user?.cryptoBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center text-orange-100 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span>Digital assets</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-green-200 text-sm font-medium mb-2">Trust Score</p>
              <p className="text-4xl font-bold mb-2">{user?.trustScore || 0}/100</p>
              <div className="flex items-center text-green-100 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>Building trust</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'transactions'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('medbeds')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  activeTab === 'medbeds'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Med Beds
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition group">
                      <div className="text-3xl mb-2">💳</div>
                      <p className="font-semibold text-gray-900">Deposit</p>
                    </button>
                    <Link href="/withdrawal" className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition group block">
                      <div className="text-3xl mb-2">💸</div>
                      <p className="font-semibold text-gray-900">Withdraw</p>
                    </Link>
                    <Link href="/medbeds" className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition group block">
                      <div className="text-3xl mb-2">🛏️</div>
                      <p className="font-semibold text-gray-900">Book Med Bed</p>
                    </Link>
                    <button className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition group">
                      <div className="text-3xl mb-2">📊</div>
                      <p className="font-semibold text-gray-900">Analytics</p>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.status === 'COMPLETED' ? 'bg-green-500' : 
                            transaction.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${getTransactionColor(transaction.status, transaction.type)}`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
                        </span>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>No transactions yet</p>
                        <p className="text-sm">Your transaction history will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                  <button 
                    onClick={loadTransactions}
                    className="text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Refresh
                  </button>
                </div>
                
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'DEPOSIT' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(transaction.createdAt)} • {transaction.provider}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getTransactionColor(transaction.status, transaction.type)}`}>
                            {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-lg mb-2">No transactions yet</p>
                      <p className="text-sm">Make your first deposit to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'medbeds' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛏️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Med Bed Booking</h3>
                <p className="text-gray-600 mb-6">Book your Med Bed session for healing and recovery</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Link href="/medbeds" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition block">
                    View Available Chambers
                  </Link>
                  <Link href="/medbeds/my-bookings" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition block">
                    My Bookings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


