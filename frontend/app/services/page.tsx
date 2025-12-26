'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  Building2, 
  Wallet, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const services = [
  {
    id: 1,
    icon: Wallet,
    title: 'Fixed Deposit',
    subtitle: 'Grow Your Savings with Assured Returns',
    description: 'Enjoy guaranteed interest rates and financial peace of mind with our flexible deposit plans.',
    features: ['Earn up to 5% annual returns', 'Flexible tenure options', 'Secure investments'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    icon: Building2,
    title: 'Current Account',
    subtitle: 'Seamless Banking for Individuals & Businesses',
    description: 'Manage your finances with ease — real-time transfers, statements, and 24/7 access.',
    features: ['Zero balance account', 'Unlimited transactions', 'Real-time notifications'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    icon: TrendingUp,
    title: 'Investments',
    subtitle: 'Smarter Strategies for Better Returns',
    description: 'Diversify your portfolio with curated investment options — powered by expert insights.',
    features: ['Expert-curated portfolios', 'Low-risk options', 'Regular returns'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    icon: CreditCard,
    title: 'Consumer Loans',
    subtitle: 'Flexible Financing for Your Needs',
    description: 'Whether it\'s a car or an emergency, we\'ve got flexible financing options.',
    features: ['Competitive interest rates', 'Quick approval', 'Flexible repayment'],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 5,
    icon: Smartphone,
    title: 'Online & Mobile Banking',
    subtitle: 'Bank Anytime, Anywhere',
    description: 'Secure and seamless digital access across all your devices.',
    features: ['Available 24/7', 'Biometric security', 'Instant transfers'],
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 6,
    icon: Shield,
    title: 'Business Banking',
    subtitle: 'Corporate Solutions for Growth',
    description: 'Manage accounts, payroll, and payments with enterprise-grade security.',
    features: ['Multi-user platform', 'Bulk payments', 'API integration'],
    color: 'from-teal-500 to-cyan-500'
  }
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Smart Banking, Real Results
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Innovative financial services designed to grow with you
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
                  {/* Number Badge */}
                  <div className="absolute top-6 right-6 text-6xl font-bold text-gray-700/30">
                    {String(service.id).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} p-3 mb-6 relative z-10`}>
                    <service.icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                    {service.title}
                  </h3>
                  <p className="text-blue-400 text-sm mb-4 relative z-10">
                    {service.subtitle}
                  </p>
                  <p className="text-gray-300 mb-6 relative z-10">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 relative z-10">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-400 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => setSelectedService(service.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of customers enjoying secure, fast, and reliable banking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl">
                Create Account
              </button>
              <button className="bg-transparent border-2 border-white text-white font-semibold py-4 px-8 rounded-lg hover:bg-white/10 transition-all duration-300">
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
