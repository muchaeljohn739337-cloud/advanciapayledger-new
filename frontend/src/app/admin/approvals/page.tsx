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
  users: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    trustScore: number;
  };
  withdrawalMethods: {
    id: string;
    type: 'BANK_TRANSFER' | 'CRYPTO' | 'PAYPAL';
    details: any;
  };
}

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const socket = useSocket();

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    loadPendingWithdrawals();
    socket.connect();

    socket.on('withdrawal_update', (data: any) => {
      console.log('Admin: Withdrawal update received:', data);
      loadPendingWithdrawals();
    });

    socket.on('admin_notification', (data: any) => {
      console.log('Admin notification:', data);
      if (data.type === 'withdrawal_request') {
        loadPendingWithdrawals();
      }
    });

    return () => {
      socket.off('withdrawal_update');
      socket.off('admin_notification');
    };
  }, []);

  const loadPendingWithdrawals = async () => {
    try {
      const response = await authService.fetchWithAuth('/api/withdrawals/admin/pending?page=1&limit=50');
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          router.push('/login');
          return;
        }
        throw new Error('Failed to load pending withdrawals');
      }

      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setModalAction('approve');
    setAdminNotes('');
    setShowModal(true);
  };

  const handleReject = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setModalAction('reject');
    setAdminNotes('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedWithdrawal || !modalAction) return;

    setProcessing(selectedWithdrawal.id);
    try {
      const endpoint = modalAction === 'approve' 
        ? `/api/withdrawals/${selectedWithdrawal.id}/approve`
        : `/api/withdrawals/${selectedWithdrawal.id}/reject`;

      const response = await authService.fetchWithAuth(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminNotes: adminNotes.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${modalAction} withdrawal`);
      }

      alert(`Withdrawal ${modalAction}d successfully!`);
      setShowModal(false);
      setSelectedWithdrawal(null);
      setModalAction(null);
      loadPendingWithdrawals();
      
    } catch (error: any) {
      console.error(`${modalAction} error:`, error);
      alert(`Failed to ${modalAction} withdrawal: ${error.message}`);
    } finally {
      setProcessing(null);
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
        return `Bank Transfer: ${method.details.accountName} (**${method.details.accountNumber?.slice(-4)})`;
      case 'CRYPTO':
        return `Crypto: ${method.details.currency} (${method.details.address?.slice(0, 12)}...${method.details.address?.slice(-8)})`;
      case 'PAYPAL':
        return `PayPal: ${method.details.email}`;
      default:
        return 'Unknown Method';
    }
  };

  const getUserDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getWithdrawalStats = () => {
    const total = withdrawals.length;
    const highTrust = withdrawals.filter(w => w.users.trustScore >= 80).length;
    const lowTrust = withdrawals.filter(w => w.users.trustScore < 50).length;
    const totalAmount = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
    
    return { total, highTrust, lowTrust, totalAmount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending withdrawals...</p>
        </div>
      </div>
    );
  }

  const stats = getWithdrawalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Withdrawal Approvals</h1>
                <p className="text-gray-600 text-sm">Review and approve withdrawal requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <button 
                onClick={loadPendingWithdrawals}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Refresh
              </button>
              <Link
                href="/admin/dashboard"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-blue-200">Pending Requests</div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.highTrust}</div>
            <div className="text-green-200">High Trust (80+)</div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.lowTrust}</div>
            <div className="text-red-200">Low Trust (<50)</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">${stats.totalAmount.toFixed(0)}</div>
            <div className="text-purple-200">Total Amount</div>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pending Withdrawal Requests</h2>
            <p className="text-gray-600 text-sm">Review each request carefully before approval</p>
          </div>

          {withdrawals.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {getUserDisplayName(withdrawal.users)}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrustScoreColor(withdrawal.users.trustScore)}`}>
                          Trust: {withdrawal.users.trustScore}/100
                        </span>
                        <span className="text-sm text-gray-500">
                          Request #{withdrawal.id.slice(-8)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{withdrawal.users.email}</p>
                      <p className="text-sm text-gray-500">
                        Requested: {formatDate(withdrawal.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">
                        ${parseFloat(withdrawal.amount).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Net: ${parseFloat(withdrawal.netAmount).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Fee: ${parseFloat(withdrawal.fee).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Withdrawal Method */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Withdrawal Method</h4>
                    <p className="text-gray-700">{getMethodDisplayName(withdrawal.withdrawalMethods)}</p>
                  </div>

                  {/* User Notes */}
                  {withdrawal.notes && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-900 mb-2">User Notes</h4>
                      <p className="text-blue-800">{withdrawal.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleReject(withdrawal)}
                      disabled={processing === withdrawal.id}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-2 rounded-lg transition font-semibold"
                    >
                      {processing === withdrawal.id ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(withdrawal)}
                      disabled={processing === withdrawal.id}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-lg transition font-semibold"
                    >
                      {processing === withdrawal.id ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Withdrawals</h3>
              <p className="text-gray-600">All withdrawal requests have been processed!</p>
            </div>
          )}
        </div>
      </main>

      {/* Approval/Rejection Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {modalAction === 'approve' ? 'Approve' : 'Reject'} Withdrawal Request
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p><strong>User:</strong> {getUserDisplayName(selectedWithdrawal.users)}</p>
              <p><strong>Amount:</strong> ${parseFloat(selectedWithdrawal.amount).toFixed(2)}</p>
              <p><strong>Net Amount:</strong> ${parseFloat(selectedWithdrawal.netAmount).toFixed(2)}</p>
              <p><strong>Method:</strong> {getMethodDisplayName(selectedWithdrawal.withdrawalMethods)}</p>
            </div>

            <div className="mb-4">
              <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes {modalAction === 'reject' && '(Required)'}
              </label>
              <textarea
                id="adminNotes"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={`Reason for ${modalAction}ing this withdrawal...`}
                required={modalAction === 'reject'}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmAction}
                disabled={processing === selectedWithdrawal.id || (modalAction === 'reject' && !adminNotes.trim())}
                className={`flex-1 font-semibold py-3 px-4 rounded-lg transition ${
                  modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white'
                }`}
              >
                {processing === selectedWithdrawal.id 
                  ? 'Processing...' 
                  : `Confirm ${modalAction === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                  setModalAction(null);
                  setAdminNotes('');
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
