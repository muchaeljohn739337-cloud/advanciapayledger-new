"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiDollarSign, FiUser, FiMail, FiLock, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { SiBitcoin, SiEthereum } from 'react-icons/si';
import { FaCcStripe } from 'react-icons/fa';
import { useLiveData } from '@/hooks/useLiveData';

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  intervalMonths: number;
  features: string[];
  isActive: boolean;
}

interface PaymentMethod {
  type: 'stripe' | 'crypto' | 'now_payments';
  currency?: string;
  icon: JSX.Element;
  name: string;
  description: string;
}

interface InstantCheckoutProps {
  planId?: string;
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    type: 'stripe',
    icon: <FaCcStripe className="w-8 h-8" />,
    name: 'Credit Card',
    description: 'Visa, Mastercard, American Express',
  },
  {
    type: 'crypto',
    currency: 'bitcoin',
    icon: <SiBitcoin className="w-8 h-8" />,
    name: 'Bitcoin',
    description: 'Pay with Bitcoin (BTC)',
  },
  {
    type: 'crypto',
    currency: 'ethereum',
    icon: <SiEthereum className="w-8 h-8" />,
    name: 'Ethereum',
    description: 'Pay with Ethereum (ETH)',
  },
];

export default function InstantCheckout({ planId, onSuccess, onCancel, isOpen }: InstantCheckoutProps) {
  const [step, setStep] = useState<'plans' | 'payment' | 'account' | 'processing' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [error, setError] = useState('');
  
  const { isConnected, lastMessage } = useLiveData();

  // Fetch payment plans
  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle plan selection from props
  useEffect(() => {
    if (planId && plans.length > 0) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setStep('payment');
      }
    }
  }, [planId, plans]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/payments/plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setError('Failed to load payment plans');
    }
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
    setStep('account');
  };

  const handleCreateAccount = async () => {
    if (!selectedPlan || !selectedPayment || !email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setStep('processing');

    try {
      const paymentMethod = {
        type: selectedPayment.type,
        currency: selectedPayment.currency,
      };

      const response = await fetch('/api/payments/instant-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          planId: selectedPlan.id,
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStep('success');
        onSuccess?.(result);
      } else {
        setError(result.error || 'Failed to create account');
        setStep('account');
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      setError('Failed to create account. Please try again.');
      setStep('account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    switch (step) {
      case 'payment':
        setStep('plans');
        break;
      case 'account':
        setStep('payment');
        break;
      case 'processing':
        setStep('account');
        break;
      default:
        onCancel?.();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onCancel?.()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {step !== 'plans' && (
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl font-bold">Join Advancia</h2>
                  <p className="text-blue-100">Start your journey in seconds</p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 flex items-center justify-center space-x-2">
              {['plans', 'payment', 'account', 'processing'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step === stepName
                        ? 'bg-white text-blue-600'
                        : ['plans', 'payment', 'account', 'processing'].indexOf(step) > index
                        ? 'bg-green-400 text-white'
                        : 'bg-white/30 text-white'
                    }`}
                  >
                    {['plans', 'payment', 'account', 'processing'].indexOf(step) > index ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div className="w-8 h-1 bg-white/30 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Step 1: Select Plan */}
            {step === 'plans' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Plan</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlanSelect(plan)}
                      className="p-6 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                        <div className="mt-4">
                          <span className="text-3xl font-bold text-gray-900">${plan.priceUSD}</span>
                          <span className="text-gray-600">/{plan.intervalMonths}mo</span>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Select Payment Method */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Choose Payment Method</h3>
                  <p className="text-gray-600 mt-1">
                    Selected: {selectedPlan?.name} - ${selectedPlan?.priceUSD}/{selectedPlan?.intervalMonths}mo
                  </p>
                </div>

                <div className="grid gap-4">
                  {PAYMENT_METHODS.map((method, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handlePaymentSelect(method)}
                      className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-blue-600">{method.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        <FiArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Account Details */}
            {step === 'account' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Create Your Account</h3>
                  <p className="text-gray-600 mt-1">
                    {selectedPayment?.name} • ${selectedPlan?.priceUSD}/{selectedPlan?.intervalMonths}mo
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <FiLock className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Instant Access</p>
                        <p className="text-blue-700 mt-1">
                          Your account will be created immediately upon payment confirmation. 
                          You''ll receive login credentials via email.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateAccount}
                    disabled={!email || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Processing...' : `Create Account & Pay $${selectedPlan?.priceUSD}`}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Processing */}
            {step === 'processing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Account</h3>
                <p className="text-gray-600">Please wait while we set up your Advancia account...</p>
                
                {isConnected && (
                  <div className="mt-4 text-sm text-green-600">
                    ✓ Connected to live updates
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Advancia!</h3>
                <p className="text-gray-600 mb-6">
                  Your account has been created successfully. Check your email for login details.
                </p>
                <button
                  onClick={onCancel}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Continue to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
