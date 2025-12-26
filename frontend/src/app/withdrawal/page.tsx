'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { useSocket } from '@/lib/socket';
import NotificationBell from '@/components/NotificationBell';

interface UserData {
  balance: number;
  cryptoBalance: number;
  email: string;
  firstName: string;
  lastName: string;
  trustScore: number;
}

interface WithdrawalMethod {
  id: string;
  type: 'BANK_TRANSFER' | 'CRYPTO' | 'PAYPAL';
  details: any;
  isActive: boolean;
  createdAt: string;
}

export default function WithdrawalRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'CRYPTO'>('USD');
  const [methodId, setMethodId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  
  // New method form
  const [newMethodType, setNewMethodType] = useState<'BANK_TRANSFER' | 'CRYPTO' | 'PAYPAL'>('BANK_TRANSFER');
  const [methodDetails, setMethodDetails] = useState<any>({});
  
  const socket = useSocket();

  useEffect(() => {
    loadUserData();
    loadWithdrawalMethods();
    socket.connect();

    socket.on('balance_update', (data: any) => {
      if (user) {
        setUser(prev => prev ? {
          ...prev,
          balance: data.balance || prev.balance,
          cryptoBalance: data.cryptoBalance || prev.cryptoBalance
        } : null);
      }
    });

    return () => {
      socket.off('balance_update');
    };
  }, []);

  const loadUserData = async () => {
    try {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

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

  const loadWithdrawalMethods = async () => {
    try {
      const response = await authService.fetchWithAuth('/api/users/profile/withdrawal-methods');
      
      if (response.ok) {
        const data = await response.json();
        setWithdrawalMethods(data.methods || []);
      }
    } catch (error) {
      console.error('Error loading withdrawal methods:', error);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const withdrawalData = {
        amount: parseFloat(amount),
        currency,
        methodId,
        notes: notes.trim() || undefined
      };

      const response = await authService.fetchWithAuth('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(withdrawalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Withdrawal request failed');
      }

      alert('Withdrawal request submitted successfully! You will receive a confirmation notification.');
      
      // Reset form
      setAmount('');
      setNotes('');
      setMethodId('');
      
      // Refresh user data to show updated balance
      loadUserData();
      
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      alert(`Withdrawal request failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await authService.fetchWithAuth('/api/users/profile/withdrawal-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: newMethodType,
          details: methodDetails
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add withdrawal method');
      }

      alert('Withdrawal method added successfully!');
      setShowAddMethod(false);
      setMethodDetails({});
      loadWithdrawalMethods();
      
    } catch (error: any) {
      console.error('Add method error:', error);
      alert(`Failed to add method: ${error.message}`);
    }
  };

  const validateForm = () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    
    const availableBalance = currency === 'USD' ? user?.balance || 0 : user?.cryptoBalance || 0;
    if (numAmount > availableBalance) {
      alert(`Insufficient balance. Available: $${availableBalance.toFixed(2)}`);
      return false;
    }
    
    if (numAmount < 10) {
      alert('Minimum withdrawal amount is $10.00');
      return false;
    }
    
    if (!methodId) {
      alert('Please select a withdrawal method');
      return false;
    }
    
    return true;
  };

  const getMethodDisplayName = (method: WithdrawalMethod) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading withdrawal page...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Request Withdrawal</h1>
                <p className="text-gray-600 text-sm">Withdraw your funds securely</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Link
                href="/withdrawal/history"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Withdrawal History
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Balance */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Available Balance</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-sm text-blue-600 font-medium mb-1">Fiat Balance</div>
                  <div className="text-3xl font-bold text-blue-800">${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-blue-600 mt-1">Available for withdrawal</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                  <div className="text-sm text-orange-600 font-medium mb-1">Crypto Balance</div>
                  <div className="text-3xl font-bold text-orange-800">${(user?.cryptoBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="text-sm text-orange-600 mt-1">Digital assets value</div>
                </div>
              </div>

              {/* Trust Score */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Trust Score</span>
                  <span className="text-2xl font-bold text-green-800">{user?.trustScore || 0}/100</span>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  {(user?.trustScore || 0) >= 50 ? 'Eligible for instant withdrawals' : 'Manual review required'}
                </div>
              </div>

              {/* Withdrawal Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Withdrawal Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Minimum: $10.00</div>
                  <div>• Processing: 1-3 business days</div>
                  <div>• Fee: 2.5% (minimum $1.00)</div>
                  <div>• Daily limit: $5,000</div>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Withdrawal Request</h2>

              <form onSubmit={handleSubmitWithdrawal} className="space-y-6">
                {/* Amount and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        id="amount"
                        step="0.01"
                        min="10"
                        max={currency === 'USD' ? user?.balance : user?.cryptoBalance}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                      Currency Type *
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'USD' | 'CRYPTO')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="USD">USD (Fiat)</option>
                      <option value="CRYPTO">Cryptocurrency</option>
                    </select>
                  </div>
                </div>

                {/* Withdrawal Method */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="method" className="block text-sm font-medium text-gray-700">
                      Withdrawal Method *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddMethod(true)}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      + Add New Method
                    </button>
                  </div>
                  
                  {withdrawalMethods.length > 0 ? (
                    <select
                      id="method"
                      value={methodId}
                      onChange={(e) => setMethodId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select withdrawal method...</option>
                      {withdrawalMethods.filter(m => m.isActive).map((method) => (
                        <option key={method.id} value={method.id}>
                          {getMethodDisplayName(method)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border border-gray-300 rounded-lg">
                      <p>No withdrawal methods available</p>
                      <button
                        type="button"
                        onClick={() => setShowAddMethod(true)}
                        className="mt-2 text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Add your first method
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional instructions or notes for this withdrawal..."
                    maxLength={500}
                  />
                  <div className="text-sm text-gray-500 mt-1">{notes.length}/500 characters</div>
                </div>

                {/* Fees Calculation */}
                {amount && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Fee Calculation</h3>
                    <div className="space-y-1 text-sm text-yellow-700">
                      <div className="flex justify-between">
                        <span>Withdrawal amount:</span>
                        <span>${parseFloat(amount || '0').toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing fee (2.5%):</span>
                        <span>${Math.max(1, parseFloat(amount || '0') * 0.025).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-yellow-200 pt-1">
                        <span>You will receive:</span>
                        <span>${(parseFloat(amount || '0') - Math.max(1, parseFloat(amount || '0') * 0.025)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!amount || !methodId || submitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {submitting ? 'Submitting Request...' : 'Submit Withdrawal Request'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Add Method Modal */}
        {showAddMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Withdrawal Method</h3>
              
              <form onSubmit={handleAddMethod} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Method Type</label>
                  <select
                    value={newMethodType}
                    onChange={(e) => setNewMethodType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CRYPTO">Cryptocurrency</option>
                    <option value="PAYPAL">PayPal</option>
                  </select>
                </div>

                {newMethodType === 'BANK_TRANSFER' && (
                  <>
                    <input
                      type="text"
                      placeholder="Account Name"
                      value={methodDetails.accountName || ''}
                      onChange={(e) => setMethodDetails(prev => ({ ...prev, accountName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={methodDetails.accountNumber || ''}
                      onChange={(e) => setMethodDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Routing Number"
                      value={methodDetails.routingNumber || ''}
                      onChange={(e) => setMethodDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </>
                )}

                {newMethodType === 'CRYPTO' && (
                  <>
                    <select
                      value={methodDetails.currency || ''}
                      onChange={(e) => setMethodDetails(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select Cryptocurrency</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="USDC">USD Coin (USDC)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Wallet Address"
                      value={methodDetails.address || ''}
                      onChange={(e) => setMethodDetails(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </>
                )}

                {newMethodType === 'PAYPAL' && (
                  <input
                    type="email"
                    placeholder="PayPal Email"
                    value={methodDetails.email || ''}
                    onChange={(e) => setMethodDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Add Method
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMethod(false);
                      setMethodDetails({});
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
