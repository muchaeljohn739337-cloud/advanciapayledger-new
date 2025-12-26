'use client';

import Link from 'next/link';

export default function TermsPage() {
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
              <Link href="/faq" className="text-gray-600 hover:text-purple-600 transition">
                FAQ
              </Link>
              <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md border border-purple-100 p-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-gray-600 mb-8">Last updated: December 25, 2025</p>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Advancia Pay ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration</h2>
              <p className="text-gray-700 mb-4">
                To use certain features of the Service, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p className="text-gray-700 mb-4">
                All new accounts require admin approval before full access is granted. This typically takes 1-2 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payment Processing</h2>
              <p className="text-gray-700 mb-4">
                Advancia Pay facilitates payment processing through third-party providers including Stripe (fiat) and Cryptomus (cryptocurrency). By using our payment services, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Comply with all applicable laws regarding payments</li>
                <li>Accept standard processing fees for transactions</li>
                <li>Understand that cryptocurrency transactions are irreversible</li>
                <li>Provide accurate payment information</li>
                <li>Not use the Service for illegal or fraudulent activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code or malware</li>
                <li>Attempt unauthorized access to systems</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the Service for fraudulent purposes</li>
                <li>Circumvent security features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Security & Privacy</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>JWT token-based authentication</li>
                <li>Password hashing with bcrypt</li>
                <li>TOTP 2FA (Two-Factor Authentication)</li>
                <li>Rate limiting and input validation</li>
                <li>Activity logging and monitoring</li>
              </ul>
              <p className="text-gray-700 mb-4">
                While we take security seriously, no system is completely secure. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Collection & Usage</h2>
              <p className="text-gray-700 mb-4">
                We collect and process data necessary to provide the Service, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Account information (email, name, username)</li>
                <li>Transaction history and payment data</li>
                <li>Activity logs (IP address, user agent, timestamps)</li>
                <li>Communication records</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We use this data to provide services, prevent fraud, and improve our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cryptocurrency Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                Cryptocurrency transactions carry inherent risks. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Cryptocurrency values are volatile and may fluctuate</li>
                <li>Transactions are irreversible once confirmed on the blockchain</li>
                <li>You are responsible for wallet security and private keys</li>
                <li>Advancia Pay is not liable for losses due to market conditions</li>
                <li>Network fees (gas fees) apply to crypto transactions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of the Service are owned by Advancia Pay and protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, Advancia Pay shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Account Suspension & Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to suspend or terminate accounts that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent activity</li>
                <li>Pose security risks</li>
                <li>Are inactive for extended periods</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by contacting support.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may modify these Terms at any time. We will notify users of significant changes via email or platform notifications. Continued use after changes constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms, contact us at:
              </p>
              <ul className="list-none text-gray-700 space-y-2 mb-4">
                <li><strong>General inquiries:</strong> support@advancia.com</li>
                <li><strong>Technical support:</strong> backend@advancia.com</li>
              </ul>
            </section>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
              <p className="text-gray-700 font-semibold mb-2">By using Advancia Pay, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
              <p className="text-gray-600 text-sm">Last updated: December 25, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm">© 2025 Advancia Pay. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/" className="text-gray-600 hover:text-purple-600 text-sm">Home</Link>
            <Link href="/faq" className="text-gray-600 hover:text-purple-600 text-sm">FAQ</Link>
            <Link href="/login" className="text-gray-600 hover:text-purple-600 text-sm">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
