'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechCorp',
      image: '👤',
      text: 'Advancia Pay transformed our payment operations. The crypto integration is seamless!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Finance Director',
      image: '👤',
      text: 'Best payment ledger system we have used. Support team is incredibly responsive.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Business Owner',
      image: '👤',
      text: 'The admin approval system and security features give us peace of mind.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className={\ixed w-full z-50 transition-all duration-300 \\}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2.5 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Advancia Pay
                </h1>
                <p className="text-xs text-gray-500">Payment Ledger</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Features
              </Link>
              <Link href="#security" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Security
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Testimonials
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                FAQ
              </Link>
              <Link href="/terms" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Terms
              </Link>
              <Link 
                href="/login" 
                className="px-5 py-2.5 text-purple-600 hover:text-purple-700 transition-colors font-medium"
              >
                Login
              </Link>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105 font-semibold"
              >
                Get Started Free
              </button>
            </div>
            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-purple-700">🔥 Bank-Grade Security Active</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Modern Payment{' '}
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent animate-gradient">
                  Ledger System
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Seamlessly manage traditional payments, cryptocurrency transactions, and user engagement in one powerful platform. Built for businesses who demand excellence.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">30-Day Money Back</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">24/7 Live Support</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">SSL Encrypted</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-xl hover:shadow-purple-500/50 hover:scale-105 text-lg font-semibold flex items-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push('#features')}
                  className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-xl hover:bg-purple-50 transition-all text-lg font-semibold hover:scale-105 shadow-lg"
                >
                  View Demo
                </button>
              </div>

              <p className="text-sm text-gray-500 flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Admin approval required (1-2 business days)</span>
              </p>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
                <div className="space-y-6">
                  {[
                    { icon: '💳', title: 'Traditional Payments', desc: 'Stripe integration for fiat transactions', color: 'purple' },
                    { icon: '⚡', title: 'Cryptocurrency', desc: 'HD wallet management & Cryptomus', color: 'blue' },
                    { icon: '🔔', title: 'Real-time Notifications', desc: 'Socket.IO instant updates & alerts', color: 'green' },
                    { icon: '🔒', title: 'Bank-Grade Security', desc: 'JWT, 2FA, encryption & monitoring', color: 'red' }
                  ].map((feature, idx) => (
                    <div key={idx} className={\group flex items-start space-x-4 p-4 rounded-xl hover:bg-\-50 transition-all cursor-pointer hover:scale-105\}>
                      <div className={\	ext-3xl transform group-hover:scale-110 transition-transform\}>{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Modern Business
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage payments, users, and transactions in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '👥', title: 'Role-Based Access', desc: '6-level hierarchy from Super Admin to Guest', color: 'from-purple-500 to-purple-600' },
              { icon: '📊', title: 'Activity Logging', desc: 'Comprehensive audit trails with IP tracking', color: 'from-blue-500 to-blue-600' },
              { icon: '🔐', title: 'Security First', desc: 'JWT, TOTP 2FA, rate limiting & validation', color: 'from-green-500 to-green-600' },
              { icon: '⭐', title: 'Trust Scores', desc: 'Intelligent user evaluation & engagement', color: 'from-yellow-500 to-yellow-600' },
              { icon: '📨', title: 'Invitation System', desc: 'Controlled onboarding with verification', color: 'from-pink-500 to-pink-600' },
              { icon: '✉️', title: 'Email Templates', desc: 'Professional notifications via Postmark', color: 'from-indigo-500 to-indigo-600' }
            ].map((feature, idx) => (
              <div key={idx} className="group relative p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl hover:-translate-y-2 cursor-pointer">
                <div className={\bsolute inset-0 bg-gradient-to-br \ opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity\}></div>
                <div className="relative">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              What Our{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Clients Say
              </span>
            </h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied customers worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-purple-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Payment Operations?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join innovative businesses using Advancia Pay for secure, scalable payment management.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => router.push('/login')}
              className="px-10 py-5 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-all text-lg font-semibold shadow-2xl hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-10 py-5 bg-purple-800 text-white rounded-xl hover:bg-purple-900 transition-all text-lg font-semibold border-2 border-white/20 hover:scale-105"
            >
              Talk to Sales
            </button>
          </div>
          <div className="flex justify-center items-center space-x-8 text-white/80">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-2 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Advancia Pay</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Modern payment ledger for traditional and crypto transactions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/faq" className="hover:text-purple-400 transition">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-purple-400 transition">Terms of Service</Link></li>
                <li><Link href="/login" className="hover:text-purple-400 transition">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="mailto:support@advancia.com" className="hover:text-purple-400 transition">Contact Us</a></li>
                <li><a href="mailto:backend@advancia.com" className="hover:text-purple-400 transition">Technical Support</a></li>
                <li><button onClick={() => setIsChatOpen(true)} className="hover:text-purple-400 transition">Live Chat</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Status</h4>
              <div className="flex items-center space-x-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-gray-400">All Systems Operational</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">© 2025 Advancia Pay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Live Chat Widget */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-50 animate-slide-up border border-purple-200">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Advancia Support</h3>
                <p className="text-xs text-purple-200">We are here 24/7</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-purple-800 rounded-lg p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="text-gray-700 mb-2">🚨 <strong>Looks like you need urgent help.</strong></p>
              <p className="text-sm text-gray-600">We are here to assist you 24/7!</p>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition font-semibold flex items-center justify-center space-x-2">
              <span>Get Help Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-xs text-center text-gray-500">Average response time: Under 2 minutes</p>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
        >
          <span className="text-2xl animate-bounce">💬</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      <style jsx global>{\
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      \}</style>
    </div>
  );
}
