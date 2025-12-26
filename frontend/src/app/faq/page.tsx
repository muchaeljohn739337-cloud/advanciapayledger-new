'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How long does admin approval take?',
    answer: 'Admin approval typically takes 1-2 business days. You will receive an email notification once your account has been approved and you can login to your dashboard.'
  },
  {
    question: 'What payment methods do you support?',
    answer: 'We support traditional fiat payments via Stripe (credit/debit cards) and cryptocurrency payments via Cryptomus. We also provide HD wallet management for crypto transactions.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! We implement industry-standard security practices including JWT authentication, TOTP 2FA, rate limiting, input validation, password hashing with bcrypt, and comprehensive activity logging.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and you will receive a password reset link. The link expires in 1 hour for security reasons.'
  },
  {
    question: 'What are trust scores?',
    answer: 'Trust scores are intelligent user evaluation metrics based on your activity, transaction history, and engagement with the platform. Higher trust scores may unlock additional features.'
  },
  {
    question: 'Can I invite other users?',
    answer: 'Yes, depending on your role and trust score, you may be able to invite other users to the platform. Check your dashboard for invitation eligibility.'
  },
  {
    question: 'How do real-time notifications work?',
    answer: 'We use Socket.IO for instant real-time notifications in your browser, plus email and push notifications to keep you updated on important account activities.'
  },
  {
    question: 'What roles are available?',
    answer: 'We have 6 role levels: Super Admin, Admin, Doctor, Moderator, User, and Guest. Each role has different permissions and access levels to features.'
  },
  {
    question: 'Can I use cryptocurrency?',
    answer: 'Yes! We support cryptocurrency transactions with HD wallet management and integration with Cryptomus for secure crypto payments.'
  },
  {
    question: 'How do I contact support?',
    answer: 'Email us at support@advancia.com for general inquiries or backend@advancia.com for technical support. We typically respond within 24 hours.'
  },
  {
    question: 'What happens if my account is rejected?',
    answer: 'If your account application is rejected, you will receive an email with the reason. You may be able to re-apply or contact support for clarification.'
  },
  {
    question: 'Are there any fees?',
    answer: 'Fee structure varies based on transaction type. Stripe processes fiat payments with standard processing fees, while crypto transactions have blockchain network fees. Contact us for detailed pricing.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Advancia Pay
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-purple-600 transition">
                Home
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-purple-600 transition">
                Terms
              </Link>
              <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about Advancia Pay
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-purple-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-purple-50 transition"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <svg
                  className={w-5 h-5 text-purple-600 transform transition-transform }
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-purple-50 border-t border-purple-100">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-purple-100 mb-6">Our support team is here to help you</p>
          <div className="flex justify-center space-x-4">
            <a
              href="mailto:support@advancia.com"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Contact Support
            </a>
            <Link
              href="/login"
              className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition font-semibold border border-purple-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm">© 2025 Advancia Pay. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/" className="text-gray-600 hover:text-purple-600 text-sm">Home</Link>
            <Link href="/terms" className="text-gray-600 hover:text-purple-600 text-sm">Terms</Link>
            <Link href="/login" className="text-gray-600 hover:text-purple-600 text-sm">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
