'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { useSocket } from '@/lib/socket';
import NotificationBell from '@/components/NotificationBell';

interface WithdrawalRequest {
  id: string;
  amount: string;
  currency: 'USD' | 'CRYPTO';
  status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED' | 'CANCELLED';
  fee: string;
  netAmount: string;
  notes: string | null;
  adminNotes: string | null;
  processedAt: string | null;
  createdAt: string;
  withdrawalMethods: {
    id: string;
    type: 'BANK_TRANSFER' | 'CRYPTO' | 'PAYPAL';
    details: any;
  };
}

export default function WithdrawalHistoryPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'processed' | 'rejected'>('all');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    loadWithdrawals();
    socket.connect();

    socket.on('withdrawal_update', (data: any) => {
      console.log('Withdrawal update received:', data);
      loadWithdrawals(); // Refresh when updates come in
    });

    return () => {
      socket.off('withdrawal_update');
    };
  }, []);

  const loadWithdrawals = async () => {
    try {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const response = await authService.fetchWithAuth('/api/withdrawals/my-requests?page=1&limit=50');
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          router.push('/login');
          return;
        }
        throw new Error('Failed to load withdrawals');
      }

      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelWithdrawal = async (withdrawalId: string) => {
    if (!confirm('Are you sure you want to cancel this withdrawal request?')) {
      return;
    }

    setCancelling(withdrawalId);
    try {
      const response = await authService.fetchWithAuth(`/api/withdrawals/${withdrawalId}/cancel`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel withdrawal');
      }

      alert('Withdrawal cancelled successfully');
      loadWithdrawals();
    } catch (error: any) {
      console.error('Cancel error:', error);
      alert(`Failed to cancel withdrawal: ${error.message}`);
    } finally {
      setCancelling(null);
    }
  };

  const getFilteredWithdrawals = () => {
    if (filter === 'all') return withdrawals;
    return withdrawals.filter(w => w.status.toLowerCase() === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMethodDisplayName = (method: any) => {
    switch (method.type) {
      case 'BANK_TRANSFER':
        return `Bank: ${method.details.accountName} (**${method.details.accountNumber?.slice(-4)})`;
      case 'CRYPTO':
        return `Crypto: ${method.details.currency} (${method.details.address?.slice(0, 8)}...${method.details.address?.slice(-6)})`;
      case 'PAYPAL':
        return `PayPal: ${method.details.email}`;
      default:
        return 'Unknown Method';
    }
  };

  const canCancel = (withdrawal: WithdrawalRequest) => {
    return withdrawal.status === 'PENDING';
  };

  const getWithdrawalStats = () => {
    const total = withdrawals.length;
    const pending = withdrawals.filter(w => w.status === 'PENDING').length;
    const processed = withdrawals.filter(w => w.status === 'PROCESSED').length;
    const rejected = withdrawals.filter(w => w.status === 'REJECTED').length;
    const totalAmount = withdrawals
      .filter(w => w.status === 'PROCESSED')
      .reduce((sum, w) => sum + parseFloat(w.netAmount), 0);
    
    return { total, pending, processed, rejected, totalAmount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading withdrawal history...</p>
        </div>
      </div>
    );
  }

  const stats = getWithdrawalStats();
  const filteredWithdrawals = getFilteredWithdrawals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Withdrawal History</h1>
                <p className="text-gray-600 text-sm">Track your withdrawal requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Link
                href="/withdrawal"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                New Request
              </Link>
              <Link
                href="/dashboard"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Back to Dashboard
              </Link>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-blue-200">Total Requests</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.pending}</div>
            <div className="text-yellow-200">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.processed}</div>
            <div className="text-green-200">Processed</div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.rejected}</div>
            <div className="text-red-200">Rejected</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">${stats.totalAmount.toFixed(0)}</div>
            <div className="text-purple-200">Total Withdrawn</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setFilter('all')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  filter === 'all'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  filter === 'pending'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('processed')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  filter === 'processed'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Processed ({stats.processed})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  filter === 'rejected'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </nav>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="space-y-6">
          {filteredWithdrawals.length > 0 ? (
            filteredWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Request #{withdrawal.id.slice(-8)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {withdrawal.currency}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        ${parseFloat(withdrawal.amount).toFixed(2)} Withdrawal
                      </h3>
                      <p className="text-gray-600">{getMethodDisplayName(withdrawal.withdrawalMethods)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        ${parseFloat(withdrawal.netAmount).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Net amount (after ${parseFloat(withdrawal.fee).toFixed(2)} fee)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">Requested: {formatDate(withdrawal.createdAt)}</span>
                    </div>
                    {withdrawal.processedAt && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Processed: {formatDate(withdrawal.processedAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">Amount: ${parseFloat(withdrawal.amount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {(withdrawal.notes || withdrawal.adminNotes) && (
                    <div className="space-y-2 mb-4">
                      {withdrawal.notes && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm"><strong className="text-blue-800">Your notes:</strong> <span className="text-blue-700">{withdrawal.notes}</span></p>
                        </div>
                      )}
                      {withdrawal.adminNotes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm"><strong className="text-gray-800">Admin notes:</strong> <span className="text-gray-700">{withdrawal.adminNotes}</span></p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      Status: {withdrawal.status} 
                      {withdrawal.status === 'PENDING' && ' (Awaiting approval)'}
                      {withdrawal.status === 'APPROVED' && ' (Processing payment)'}
                    </span>
                    <div className="flex space-x-2">
                      {canCancel(withdrawal) && (
                        <button
                          onClick={() => cancelWithdrawal(withdrawal.id)}
                          disabled={cancelling === withdrawal.id}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                        >
                          {cancelling === withdrawal.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}
                      <Link
                        href="/withdrawal"
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                      >
                        New Request
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No withdrawal requests yet' : `No ${filter} withdrawals`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start by making your first withdrawal request.' 
                  : `You don't have any ${filter} withdrawal requests.`}
              </p>
              {filter === 'all' && (
                <Link
                  href="/withdrawal"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition inline-block"
                >
                  Request Your First Withdrawal
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
