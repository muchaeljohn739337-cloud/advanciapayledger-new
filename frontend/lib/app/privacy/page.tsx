'use client';

import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, FileText, Lock, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-blue-900 font-semibold">Privacy Policy</span>
            </div>

            <h1 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Privacy Matters
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We are committed to protecting your personal information and being transparent about
              how we collect, use, and safeguard your data.
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
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Introduction
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Advancia Pay Ledger ("we," "our," or "us") respects your privacy and is committed to
              protecting your personal data. This privacy policy explains how we collect, use,
              disclose, and safeguard your information when you use our fintech platform, website,
              and services.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              By using our services, you agree to the collection and use of information in
              accordance with this policy. If you do not agree with our policies and practices,
              please do not use our services.
            </p>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Name, email address, phone number</li>
                  <li>Date of birth and government-issued ID for verification</li>
                  <li>Billing address and payment information</li>
                  <li>Account credentials and authentication data</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Transaction history and payment records</li>
                  <li>Bank account details (encrypted and tokenized)</li>
                  <li>Cryptocurrency wallet addresses</li>
                  <li>Balance and portfolio information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>IP address, device information, and browser type</li>
                  <li>Usage data, cookies, and analytics information</li>
                  <li>Location data (with your consent)</li>
                  <li>Log files and error reports</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* How We Use Your Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Service Delivery:</strong> To provide, maintain, and improve our fintech
                  services
                </li>
                <li>
                  <strong>Security:</strong> To authenticate users, prevent fraud, and protect
                  against security threats
                </li>
                <li>
                  <strong>Compliance:</strong> To meet legal obligations, including KYC/AML
                  requirements
                </li>
                <li>
                  <strong>Communication:</strong> To send transaction notifications, account
                  updates, and important service information
                </li>
                <li>
                  <strong>Analytics:</strong> To analyze usage patterns and improve user experience
                </li>
                <li>
                  <strong>Support:</strong> To respond to your inquiries and provide customer
                  support
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Lock className="w-8 h-8 text-blue-600" />
              Data Security
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We implement industry-leading security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Encryption:</strong> AES-256 encryption for data at rest and TLS 1.3 for
                data in transit
              </li>
              <li>
                <strong>Access Controls:</strong> Multi-factor authentication and role-based access
                controls
              </li>
              <li>
                <strong>Secure Storage:</strong> Data stored in secure, compliant data centers with
                regular backups
              </li>
              <li>
                <strong>Monitoring:</strong> 24/7 security monitoring and intrusion detection
                systems
              </li>
              <li>
                <strong>Compliance:</strong> SOC 2 Type II, PCI-DSS Level 1, and GDPR compliant
              </li>
            </ul>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your data (subject to legal
                requirements)
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a machine-readable format
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from marketing communications
              </li>
              <li>
                <strong>Objection:</strong> Object to certain processing activities
              </li>
            </ul>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at{' '}
              <a
                href="mailto:privacy@advanciapayledger.com"
                className="text-blue-600 hover:underline"
              >
                privacy@advanciapayledger.com
              </a>
            </p>
          </motion.div>

          {/* Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze
              usage, and assist with marketing efforts. You can control cookies through your browser
              settings, though this may affect certain features of our service.
            </p>
          </motion.div>

          {/* Third-Party Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We may share your information with trusted third-party service providers who assist us
              in operating our platform, including payment processors, cloud hosting providers, and
              analytics services. These parties are contractually obligated to protect your
              information and use it only for specified purposes.
            </p>
          </motion.div>

          {/* Children's Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly
              collect personal information from children. If you believe we have collected
              information from a child, please contact us immediately.
            </p>
          </motion.div>

          {/* Changes to Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the "Last
              Updated" date. Your continued use of our services after such changes constitutes
              acceptance of the updated policy.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              If you have questions about this privacy policy or our data practices, please contact
              us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:privacy@advanciapayledger.com"
                  className="text-blue-600 hover:underline"
                >
                  privacy@advanciapayledger.com
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
