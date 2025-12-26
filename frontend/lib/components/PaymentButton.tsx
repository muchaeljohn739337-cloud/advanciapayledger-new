"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiZap, FiShield } from 'react-icons/fi';
import InstantCheckout from './payment/InstantCheckout';

interface PaymentButtonProps {
  planId?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PaymentButton({ 
  planId, 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: PaymentButtonProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const handleSuccess = (result: any) => {
    console.log('Payment successful:', result);
    setShowCheckout(false);
    // Could redirect to dashboard or show success message
  };

  const defaultText = variant === 'primary' ? 'Get Started' : 'Choose Plan';

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowCheckout(true)}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {children || defaultText}
        {variant === 'primary' && <FiArrowRight className="ml-2 w-4 h-4" />}
      </motion.button>

      <InstantCheckout
        isOpen={showCheckout}
        planId={planId}
        onSuccess={handleSuccess}
        onCancel={() => setShowCheckout(false)}
      />
    </>
  );
}

// Quick start component for landing page
export function QuickStartSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Journey in Seconds
            </h2>
            <p className="text-xl text-gray-600">
              No complex setup. Just click, pay, and you''re in.
            </p>
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiZap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Access</h3>
              <p className="text-gray-600">Create your account and start immediately. No waiting for approval.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600">Multiple payment options including crypto and traditional cards.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-6"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Features</h3>
              <p className="text-gray-600">Unlock advanced tools and capabilities from day one.</p>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <PaymentButton size="lg">
              Start Free Trial
            </PaymentButton>
            
            <PaymentButton variant="secondary" size="lg">
              View All Plans
            </PaymentButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-sm text-gray-500"
          >
            No credit card required for trial • Cancel anytime • Full refund in first 30 days
          </motion.p>
        </div>
      </div>
    </section>
  );
}
