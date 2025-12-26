'use client';

import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Scale } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Logo size="md" showText={true} variant="gradient" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
              <Scale className="h-6 w-6 text-blue-600" />
              <span className="text-blue-900 font-semibold">Terms of Service</span>
            </div>

            <h1 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Terms & Conditions
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Please read these terms carefully before using Advancia Pay Ledger services. By using
              our platform, you agree to be bound by these terms.
            </p>

            <p className="text-sm text-slate-500">
              Last Updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-12">
          {/* Acceptance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              By accessing or using Advancia Pay Ledger ("the Service"), you agree to be bound by
              these Terms of Service ("Terms"). If you disagree with any part of these terms, you
              may not access the Service.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              We reserve the right to update, change, or replace any part of these Terms by posting
              updates to our website. Your continued use of the Service after any changes
              constitutes acceptance of the new Terms.
            </p>
          </motion.div>

          {/* Eligibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              2. Eligibility and Account Registration
            </h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">To use our Service, you must:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Be at least 18 years old</li>
                <li>Have the legal capacity to enter into binding agreements</li>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                You are responsible for all activities that occur under your account. We are not
                liable for any loss or damage arising from your failure to maintain account
                security.
              </p>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Description of Services</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Advancia Pay Ledger provides a comprehensive fintech platform including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Digital payment processing and money transfers</li>
              <li>Cryptocurrency trading and portfolio management</li>
              <li>Multi-currency wallet services</li>
              <li>Financial analytics and reporting tools</li>
              <li>Debit card issuance and management</li>
              <li>Rewards and loyalty programs</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at
              any time, with or without notice.
            </p>
          </motion.div>

          {/* User Obligations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              4. User Obligations and Prohibited Activities
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Engage in money laundering, fraud, or financial crimes</li>
              <li>Impersonate any person or entity</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              Violation of these terms may result in immediate account termination and legal action.
            </p>
          </motion.div>

          {/* Fees and Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Fees and Payment Terms</h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Our fee structure is transparent and disclosed before you complete any transaction:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Transaction Fees:</strong> Standard transactions incur a 1.5% processing
                  fee
                </li>
                <li>
                  <strong>Subscription Fees:</strong> Premium and Enterprise plans have
                  monthly/annual fees
                </li>
                <li>
                  <strong>Crypto Fees:</strong> Network fees apply to blockchain transactions
                </li>
                <li>
                  <strong>Currency Conversion:</strong> Exchange rates and fees apply for currency
                  conversions
                </li>
              </ul>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                All fees are non-refundable unless required by law or as specified in our refund
                policy. We reserve the right to change fees with 30 days' notice.
              </p>
            </div>
          </motion.div>

          {/* Refund Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              6. 30-Day Money-Back Guarantee
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We offer a 30-day money-back guarantee for new subscriptions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Full refund available within 30 days of initial subscription</li>
              <li>No questions asked - simply contact our support team</li>
              <li>Refunds processed within 5-10 business days</li>
              <li>Transaction fees are non-refundable</li>
              <li>One refund per customer account</li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              To request a refund, contact us at{' '}
              <a
                href="mailto:support@advanciapayledger.com"
                className="text-blue-600 hover:underline"
              >
                support@advanciapayledger.com
              </a>{' '}
              or through our support portal.
            </p>
          </motion.div>

          {/* Intellectual Property */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              All content, features, and functionality of the Service, including but not limited to
              text, graphics, logos, icons, and software, are owned by Advancia Pay Ledger and
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              You may not reproduce, distribute, modify, or create derivative works from any part of
              the Service without our express written permission.
            </p>
          </motion.div>

          {/* Limitation of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>
                Our total liability shall not exceed the amount you paid us in the 12 months
                preceding the claim
              </li>
              <li>
                We are not responsible for losses due to market fluctuations, third-party actions,
                or force majeure events
              </li>
            </ul>
          </motion.div>

          {/* Indemnification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Advancia Pay Ledger, its officers,
              directors, employees, and agents from any claims, damages, losses, liabilities, and
              expenses (including legal fees) arising from your use of the Service, violation of
              these Terms, or infringement of any rights of another.
            </p>
          </motion.div>

          {/* Termination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for
              conduct that we believe violates these Terms or is harmful to other users, us, or
              third parties.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              You may terminate your account at any time by contacting our support team. Upon
              termination, your right to use the Service will cease immediately, but certain
              provisions of these Terms will survive termination.
            </p>
          </motion.div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which Advancia Pay Ledger operates, without regard to its conflict of
              law provisions. Any disputes arising from these Terms shall be resolved through
              binding arbitration or in the appropriate courts.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:legal@advanciapayledger.com"
                  className="text-blue-600 hover:underline"
                >
                  legal@advanciapayledger.com
                </a>
              </p>
              <p>
                <strong>Support:</strong>{' '}
                <Link href="/support" className="text-blue-600 hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <Logo size="md" showText={true} variant="gradient" />
          </Link>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Advancia Pay Ledger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
