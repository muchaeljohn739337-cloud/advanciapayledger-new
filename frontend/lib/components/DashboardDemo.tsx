'use client';

import { motion } from 'framer-motion';
import { BarChart3, Globe, Monitor, Play, Shield, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';

export default function DashboardDemo() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <>
      {/* Product Demo Video Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">See It In Action</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Experience the Power of Advancia
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch how easy it is to manage your finances with our intuitive dashboard
            </p>
          </motion.div>

          {/* Video Container with Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
            
            {/* Browser Window Frame */}
            <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-700 rounded-lg px-4 py-1.5 text-sm text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>https://app.advancia-pay.com/dashboard</span>
                  </div>
                </div>
                <Monitor className="w-5 h-5 text-gray-400" />
              </div>

              {/* Video/Screenshot Container */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-purple-900">
                {/* Dashboard Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-gray-900/80">
                  <div className="absolute inset-0 p-8">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Total Balance', value: '$124,582.00', change: '+12.5%' },
                        { label: 'BTC Holdings', value: '2.45 BTC', change: '+8.2%' },
                        { label: 'ETH Holdings', value: '18.32 ETH', change: '+15.7%' },
                        { label: 'Monthly Profit', value: '$8,432.00', change: '+22.1%' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                        >
                          <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                          <p className="text-white font-bold text-lg">{stat.value}</p>
                          <p className="text-green-400 text-xs">{stat.change}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div className="grid grid-cols-3 gap-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-white font-semibold">Portfolio Performance</p>
                          <div className="flex gap-2">
                            {['1D', '1W', '1M', '1Y'].map((t) => (
                              <span key={t} className={`px-2 py-1 rounded text-xs ${t === '1M' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <svg className="w-full h-32" viewBox="0 0 400 100">
                          <motion.path
                            d="M0,80 Q50,70 100,60 T200,40 T300,30 T400,10"
                            fill="none"
                            stroke="url(#chartGradient)"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                          />
                          <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8B5CF6" />
                              <stop offset="100%" stopColor="#06B6D4" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                      >
                        <p className="text-white font-semibold mb-3">Recent Activity</p>
                        <div className="space-y-3">
                          {[
                            { type: 'Received', amount: '+$2,500', time: '2m ago' },
                            { type: 'Sent', amount: '-$850', time: '1h ago' },
                            { type: 'Swap', amount: 'BTC→ETH', time: '3h ago' },
                          ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{tx.type}</span>
                              <span className={tx.amount.startsWith('+') ? 'text-green-400' : tx.amount.startsWith('-') ? 'text-red-400' : 'text-purple-400'}>{tx.amount}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Play Button Overlay */}
                <motion.button
                  onClick={() => setShowVideoModal(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer z-10"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                    <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:bg-purple-50 transition-colors">
                      <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <span className="absolute bottom-8 text-white font-semibold text-lg drop-shadow-lg">
                    Watch Demo
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { icon: Zap, text: 'Real-time Updates' },
                { icon: Shield, text: 'Bank-Grade Security' },
                { icon: BarChart3, text: 'Advanced Analytics' },
                { icon: Globe, text: 'Multi-Currency' },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-100"
                >
                  <badge.icon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-purple-400 transition-colors"
            >
              <span className="text-lg font-semibold">Close ✕</span>
            </button>

            <video 
                controls 
                autoPlay 
                muted
                loop
                playsInline
                className="w-full h-full rounded-2xl"
                poster="/images/dashboard-preview.png"
              >
                <source src="/videos/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
