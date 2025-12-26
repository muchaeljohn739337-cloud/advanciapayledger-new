"use client";

import Logo from "@/components/Logo";
import AnimatedSection, { FloatingElement, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { FeatureFlipCard } from "@/components/ui/FlipCard";
import ParticlesBackground from "@/components/ui/ParticlesBackground";
import Testimonials from "@/components/ui/Testimonials";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Globe,
  Menu,
  PlayCircle,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Parallax refs and scroll tracking
  const heroRef = useRef<HTMLElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: isHydrated ? heroRef : undefined,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });
  
  // Parallax transforms
  const heroBackgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // Mark as hydrated for parallax
    setIsHydrated(true);
    
    // Enable smooth scrolling globally
    document.documentElement.style.scrollBehavior = "smooth";
    
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");

    if (token && userEmail) {
      setIsAuthenticated(true);
      router.push("/dashboard");
    } else {
      setIsAuthenticated(false);
      // Redirect to registration page if not authenticated
      router.push("/auth/register");
    }
    setIsLoading(false);
    
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-600">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        {/* Advanced Navigation */}
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              <Link href="/" className="flex items-center">
                <Logo size="md" showText={true} variant="gradient" />
              </Link>
              <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer text-sm lg:text-base"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("demo")}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer text-sm lg:text-base"
                >
                  Demo
                </button>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm lg:text-base"
                >
                  Pricing
                </Link>
                <Link
                  href="/faq"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm lg:text-base"
                >
                  FAQ
                </Link>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer text-sm lg:text-base"
                >
                  How It Works
                </button>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm lg:text-base"
                >
                  Sign In
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/auth/register"
                    className="group relative bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base font-semibold shadow-lg shadow-blue-500/30 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">Get Started Free</span>
                  </Link>
                </motion.div>
              </div>
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-purple-600 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 py-4 space-y-3"
              >
                <button
                  onClick={() => {
                    scrollToSection("features");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2 px-4"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    scrollToSection("demo");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2 px-4"
                >
                  Demo
                </button>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2 px-4"
                >
                  Pricing
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2 px-4"
                >
                  FAQ
                </Link>
                <button
                  onClick={() => {
                    scrollToSection("how-it-works");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2 px-4"
                >
                  How It Works
                </button>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-purple-600 transition-colors font-medium py-2 px-4"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md text-center mt-2"
                >
                  Get Started Free
                </Link>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Hero Section with Parallax & Particles */}
        <section
          ref={heroRef}
          className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden"
        >
          {/* Particles Background */}
          <motion.div style={{ y: particlesY }} className="absolute inset-0 z-0">
            <ParticlesBackground variant="hero" className="opacity-70" />
          </motion.div>

          {/* Parallax Background Elements */}
          <motion.div style={{ y: heroBackgroundY }} className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            <FloatingElement intensity="subtle" delay={0}>
              <div className="absolute top-20 right-1/4 w-72 h-72 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            </FloatingElement>
          </motion.div>

          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

          <motion.div
            style={{ y: heroContentY, opacity: heroOpacity }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* 30-Day Money-Back Guarantee Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-md rounded-full mb-8 border-2 border-white/40 shadow-2xl cursor-default"
              >
                <Award className="w-6 h-6 text-yellow-300 animate-pulse" />
                <span className="text-base font-bold tracking-wide">
                  30-Day Money-Back Guarantee
                </span>
              </motion.div>

              <motion.h1
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight px-4 font-display"
              >
                <motion.span 
                  className="inline-block text-white drop-shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Advancia Pay Ledger
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-10 max-w-4xl mx-auto text-white/95 leading-relaxed font-medium px-4"
              >
                Instant payments with{" "}
                <span className="font-bold text-yellow-300">bank-grade security</span>. Balance
                updates in <span className="font-bold text-cyan-300">real time</span>. Always
                available.
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 w-full sm:w-auto"
              >
                {/* Primary CTA with Enhanced Hover */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    href="/auth/register"
                    className="group relative bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black shadow-2xl shadow-cyan-500/30 inline-flex items-center justify-center gap-3 border-4 border-white/30 overflow-hidden w-full sm:w-auto"
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {/* Glow pulse */}
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg relative z-10" />
                    <span className="relative drop-shadow-md z-10">Create secure account</span>
                    <motion.span
                      className="relative z-10"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg" />
                    </motion.span>
                  </Link>
                </motion.div>

                {/* Secondary CTA */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full sm:w-auto"
                >
                  <button
                    onClick={() => scrollToSection("features")}
                    className="group relative px-6 sm:px-8 md:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold border-3 border-cyan-300/80 hover:border-cyan-200 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md shadow-xl shadow-cyan-400/20 inline-flex items-center justify-center gap-3 overflow-hidden w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">Explore Features</span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-16 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-sm sm:text-base px-4"
              >
                {[
                  { icon: CheckCircle2, text: "No Credit Card Required", color: "text-green-300" },
                  { icon: Shield, text: "Bank-Grade Security", color: "text-blue-300" },
                  { icon: Zap, text: "24/7 Support", color: "text-yellow-300" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/15 backdrop-blur-sm rounded-full border border-white/30 cursor-default"
                  >
                    <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                    <span className="font-semibold">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <motion.button
              onClick={() => scrollToSection("stats")}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center text-white/70 hover:text-white transition-colors"
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          </motion.div>
        </section>

        {/* Stats Section */}
        <AnimatedSection id="stats" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2 font-display">
                Trusted Worldwide
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">Real numbers, real impact</p>
            </motion.div>

            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" staggerDelay={0.15}>
              {[
                {
                  value: "10K+",
                  label: "Active Users",
                  icon: Users,
                  gradient: "from-purple-500 to-purple-700",
                  bgGradient: "from-purple-50 to-purple-100",
                  description: "Growing community",
                },
                {
                  value: "$5M+",
                  label: "Transactions",
                  icon: DollarSign,
                  gradient: "from-green-500 to-emerald-700",
                  bgGradient: "from-green-50 to-emerald-100",
                  description: "Processed securely",
                },
                {
                  value: "99.9%",
                  label: "Uptime",
                  icon: TrendingUp,
                  gradient: "from-blue-500 to-cyan-700",
                  bgGradient: "from-blue-50 to-cyan-100",
                  description: "Always available",
                },
                {
                  value: "50+",
                  label: "Countries",
                  icon: Globe,
                  gradient: "from-orange-500 to-red-700",
                  bgGradient: "from-orange-50 to-red-100",
                  description: "Global reach",
                },
              ].map((stat, index) => (
                <StaggerItem key={stat.label}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.05 }}
                    className="group relative"
                  >
                    <div
                      className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white overflow-hidden`}
                    >
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-20 rounded-bl-full group-hover:scale-150 transition-transform duration-500`}
                      />

                      <div className="relative">
                        <FloatingElement intensity="subtle" delay={index * 0.2}>
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg mx-auto group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                          >
                            <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                          </div>
                        </FloatingElement>

                        <div
                          className={`text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}
                        >
                          {stat.value}
                        </div>

                        <div className="text-gray-800 font-bold text-base sm:text-lg mb-1">
                          {stat.label}
                        </div>

                        <div className="text-gray-600 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {stat.description}
                        </div>

                        <div className={`mt-4 h-2 bg-white/50 rounded-full overflow-hidden`}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 + 0.5, duration: 1.5 }}
                            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold">SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">GDPR Compliant</span>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Value Pillars with 3D Flip Cards */}
        <AnimatedSection id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-6"
              >
                <span className="px-5 py-2.5 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 border border-purple-200 rounded-full text-sm font-bold text-purple-700 uppercase tracking-widest shadow-sm">
                  ✨ Platform Advantages
                </span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 px-4 font-display">
                Why Choose{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500">
                  Advancia Pay Ledger?
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Built for modern businesses and individuals who demand excellence
              </p>
            </motion.div>

            {/* 3D Flip Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                {
                  icon: <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
                  title: "Bank-Grade Security",
                  description: "End-to-end encryption, fraud protection, and multi-factor authentication keep your funds secure 24/7.",
                  gradient: "from-blue-500 via-blue-600 to-indigo-600",
                  iconBg: "from-blue-500/20 to-indigo-500/20",
                  borderColor: "hover:border-blue-300",
                  emoji: "🔒",
                  benefits: [
                    "256-bit AES encryption",
                    "Multi-factor authentication",
                    "Real-time fraud detection",
                    "SOC 2 Type II certified",
                  ],
                },
                {
                  icon: <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
                  title: "Lightning Fast",
                  description: "Real-time balance updates, instant transactions, and zero delays. Your money moves when you need it.",
                  gradient: "from-yellow-500 via-orange-500 to-red-500",
                  iconBg: "from-yellow-500/20 to-orange-500/20",
                  borderColor: "hover:border-yellow-300",
                  emoji: "⚡",
                  benefits: [
                    "Sub-second transactions",
                    "Real-time notifications",
                    "Instant balance updates",
                    "99.9% uptime guaranteed",
                  ],
                },
                {
                  icon: <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
                  title: "Global Reach",
                  description: "Send and receive payments worldwide. Support for multiple currencies and international transactions.",
                  gradient: "from-green-500 via-emerald-600 to-teal-600",
                  iconBg: "from-green-500/20 to-teal-500/20",
                  borderColor: "hover:border-green-300",
                  emoji: "🌍",
                  benefits: [
                    "50+ supported countries",
                    "Multi-currency support",
                    "Low FX rates",
                    "Local payment methods",
                  ],
                },
                {
                  icon: <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />,
                  title: "Smart Analytics",
                  description: "AI-powered insights, predictive analytics, and comprehensive reports help you make better decisions.",
                  gradient: "from-purple-500 via-violet-600 to-purple-700",
                  iconBg: "from-purple-500/20 to-violet-500/20",
                  borderColor: "hover:border-purple-300",
                  emoji: "📊",
                  benefits: [
                    "AI-powered insights",
                    "Spending categorization",
                    "Custom reports",
                    "Predictive analytics",
                  ],
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <FeatureFlipCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    gradient={feature.gradient}
                    iconBg={feature.iconBg}
                    borderColor={feature.borderColor}
                    emoji={feature.emoji}
                    benefits={feature.benefits}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Advanced Features Section */}
        <AnimatedSection className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-200 rounded-full text-sm font-semibold text-purple-700 uppercase tracking-wider">
                  Next-Gen Financial Technology
                </span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 mb-4 sm:mb-6 font-display">
                Powerful Features
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Enterprise-grade capabilities designed for the future of finance
              </p>
            </motion.div>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.05}>
              {[
                { text: "Real-time balance updates & notifications", icon: "🔔", color: "from-yellow-500 to-orange-500" },
                { text: "Multi-currency wallet support (USD, BTC, ETH, USDT)", icon: "💰", color: "from-green-500 to-emerald-600" },
                { text: "Advanced crypto trading & portfolio tracking", icon: "📈", color: "from-blue-500 to-cyan-500" },
                { text: "AI-powered fraud detection & security", icon: "🛡️", color: "from-purple-500 to-pink-500" },
                { text: "Instant payment processing", icon: "⚡", color: "from-indigo-500 to-blue-500" },
                { text: "Comprehensive transaction history", icon: "📋", color: "from-teal-500 to-green-500" },
                { text: "Role-based access control for teams", icon: "👥", color: "from-slate-600 to-gray-700" },
                { text: "Mobile app for iOS & Android", icon: "📱", color: "from-blue-600 to-indigo-600" },
                { text: "API integration for developers", icon: "🔌", color: "from-gray-600 to-slate-700" },
                { text: "Automated financial reporting", icon: "📊", color: "from-violet-500 to-purple-600" },
                { text: "Debit card ordering & management", icon: "💳", color: "from-rose-500 to-red-500" },
                { text: "Rewards & loyalty program", icon: "🎁", color: "from-pink-500 to-rose-500" },
              ].map((feature, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start space-x-4">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
                      >
                        {feature.icon}
                      </motion.div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-800 font-semibold leading-relaxed group-hover:text-gray-900">
                          {feature.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* Demo Videos Section */}
        <AnimatedSection className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-200 rounded-full text-sm font-semibold text-cyan-700 uppercase tracking-wider">
                  See It In Action
                </span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-4 sm:mb-6 font-display">
                Platform Demos
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Watch how Advancia Pay Ledger transforms financial management
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Demo 1: Dashboard Overview */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="w-full"
              >
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0.5 sm:p-1">
                  <div className="aspect-video bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-lg sm:rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* Animated Background Grid */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                      }} />
                    </div>
                    
                    {/* Dashboard Preview Animation */}
                    <motion.div
                      className="relative z-10 text-center p-4 sm:p-6 md:p-8"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs sm:text-sm text-cyan-300 font-semibold">Live Dashboard</div>
                          <div className="text-xl sm:text-2xl font-black text-white">$24,582.45</div>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 justify-center">
                        {[40, 70, 45, 85, 60, 95, 70].map((height, i) => (
                          <motion.div
                            key={i}
                            className="w-4 sm:w-6 md:w-8 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t"
                            animate={{ height: [`${height * 0.6}px`, `${height * 0.4}px`, `${height * 0.6}px`] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 sm:mt-4 text-cyan-200 text-xs sm:text-sm font-medium">
                        Real-time analytics in action
                      </div>
                    </motion.div>

                    {/* Play Button Overlay */}
                    <Link href="/dashboard" className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all group">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-600" />
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-display">Real-Time Dashboard</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Get instant visibility into your finances with our intuitive dashboard. Monitor balances, track transactions, and analyze spending patterns in real-time.
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2 flex-shrink-0">✓</span>
                      <span>Live balance updates across all accounts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2 flex-shrink-0">✓</span>
                      <span>Visual spending analytics & charts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-600 mr-2 flex-shrink-0">✓</span>
                      <span>Quick access to recent transactions</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Demo 2: Payment Processing */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-0.5 sm:p-1">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 rounded-lg sm:rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* Animated Payment Flow */}
                    <div className="absolute inset-0 opacity-10">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-purple-400 rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>

                    {/* Payment Animation */}
                    <motion.div
                      className="relative z-10 text-center p-8"
                      animate={{
                        y: [0, -10, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="flex items-center gap-6 justify-center mb-6">
                        <div className="text-right">
                          <div className="text-sm text-purple-300">Sending</div>
                          <div className="text-3xl font-black text-white">$500</div>
                        </div>
                        <motion.div
                          animate={{
                            x: [0, 30, 0],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Zap className="w-12 h-12 text-yellow-400" fill="currentColor" />
                        </motion.div>
                        <div className="text-left">
                          <div className="text-sm text-purple-300">To Friend</div>
                          <div className="text-xl font-bold text-white">Instant</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-center text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Payment Confirmed</span>
                      </div>
                    </motion.div>

                    {/* Play Button Overlay */}
                    <Link href="/dashboard" className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all group">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <PlayCircle className="w-8 h-8 text-purple-600" />
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">Lightning-Fast Payments</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Transfer funds in seconds with our secure payment system. Support for multiple currencies, scheduled payments, and instant notifications.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">✓</span>
                      <span>Sub-second transaction processing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">✓</span>
                      <span>Multi-currency & crypto support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">✓</span>
                      <span>Scheduled & recurring payments</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Demo 3: AI Analytics (Full Width) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-2 w-full"
              >
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 p-0.5 sm:p-1">
                  <div className="aspect-video bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-lg sm:rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* Animated Data Waves */}
                    <div className="absolute inset-0">
                      <motion.div
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: 'repeating-linear-gradient(90deg, transparent 0, #10b981 50px, transparent 100px)'
                        }}
                        animate={{
                          x: [-1000, 0]
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </div>

                    {/* AI Analytics Display */}
                    <motion.div className="relative z-10 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      {/* Spending Prediction */}
                      <motion.div
                        className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-green-400/30"
                        animate={{
                          scale: [1, 1.05, 1],
                          borderColor: ['rgba(74, 222, 128, 0.3)', 'rgba(74, 222, 128, 0.8)', 'rgba(74, 222, 128, 0.3)']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 0
                        }}
                      >
                        <div className="text-xs sm:text-sm text-emerald-300 mb-2">This Month</div>
                        <div className="text-2xl sm:text-3xl font-black text-white mb-1">$3,240</div>
                        <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>12% less than predicted</span>
                        </div>
                      </motion.div>

                      {/* Category Insights */}
                      <motion.div
                        className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30"
                        animate={{
                          scale: [1, 1.05, 1],
                          borderColor: ['rgba(52, 211, 153, 0.3)', 'rgba(52, 211, 153, 0.8)', 'rgba(52, 211, 153, 0.3)']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 1
                        }}
                      >
                        <div className="text-xs sm:text-sm text-emerald-300 mb-2">Top Category</div>
                        <div className="text-xl sm:text-2xl font-bold text-white mb-1">Groceries</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>$840</span>
                            <span>68%</span>
                          </div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-emerald-400 to-green-500"
                              animate={{ width: ['0%', '68%'] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Savings Suggestion */}
                      <motion.div
                        className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-teal-400/30"
                        animate={{
                          scale: [1, 1.05, 1],
                          borderColor: ['rgba(45, 212, 191, 0.3)', 'rgba(45, 212, 191, 0.8)', 'rgba(45, 212, 191, 0.3)']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 2
                        }}
                      >
                        <div className="text-xs sm:text-sm text-emerald-300 mb-2">AI Suggestion</div>
                        <div className="text-lg sm:text-xl font-bold text-white mb-1">Save $180</div>
                        <div className="text-xs text-gray-300">
                          Switch to annual subscriptions
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Play Button Overlay */}
                    <Link href="/dashboard" className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all group">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <PlayCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="mt-6 grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Financial Insights</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our AI-powered analytics engine analyzes your spending patterns, predicts future expenses, and provides actionable recommendations to optimize your finances.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Predictive spending analysis</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Automated monthly/weekly reports</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Budget tracking & alerts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Export to CSV/PDF for accounting</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* Dashboard Preview Section */}
        <AnimatedSection className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              <div className="space-y-8">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-5xl md:text-6xl font-black text-gray-900 leading-tight"
                >
                  Trade Smarter with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600">
                    Real-Time Intelligence
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl text-gray-700 leading-relaxed font-light"
                >
                  Professional-grade trading dashboard with institutional-level analytics.
                </motion.p>

                <StaggerContainer className="space-y-4" staggerDelay={0.1}>
                  {[
                    { icon: "📊", title: "Live Market Data", desc: "Real-time prices & charts", gradient: "from-indigo-500 to-purple-600" },
                    { icon: "🤖", title: "AI-Powered Insights", desc: "Machine learning predictions", gradient: "from-purple-500 to-fuchsia-600" },
                    { icon: "📈", title: "Portfolio Tracking", desc: "Comprehensive monitoring", gradient: "from-fuchsia-500 to-pink-600" },
                  ].map((item, index) => (
                    <StaggerItem key={index}>
                      <motion.div
                        whileHover={{ x: 10, scale: 1.02 }}
                        className="flex items-start space-x-5 p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 shadow-lg border-2 border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 group"
                      >
                        <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                          <p className="text-base text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>

              <div>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotateY: 15 }}
                  whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  whileHover={{ scale: 1.02, rotateY: -5 }}
                  className="relative group"
                  style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 rounded-3xl opacity-30 blur-2xl group-hover:opacity-50 transition-all duration-500" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500" />

                  <div className="relative rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm bg-white/10 border-2 border-white/50 group-hover:border-indigo-300/70 transition-all duration-500">
                    <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 via-purple-50 to-fuchsia-100 relative">
                      <Image
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=900&fit=crop&q=80"
                        alt="Professional trading dashboard"
                        width={1200}
                        height={900}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 via-transparent to-fuchsia-900/10 group-hover:from-indigo-900/5 transition-all duration-500" />
                    </div>
                    <div className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Pro Analytics
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -left-6 w-32 h-32 border-4 border-indigo-400/30 rounded-3xl transform -rotate-12 group-hover:-rotate-6 transition-all duration-500" />
                  <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-fuchsia-400/30 rounded-3xl transform rotate-12 group-hover:rotate-6 transition-all duration-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* How It Works */}
        <AnimatedSection id="how-it-works" className="py-24 bg-gradient-to-b from-white via-purple-50/30 to-white relative overflow-hidden">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-2 border-purple-200 rounded-full text-sm font-black text-purple-700 uppercase tracking-widest mb-6"
              >
                🚀 Quick Setup Process
              </motion.span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 font-display">
                Get Started in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-600">
                  Minutes
                </span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto px-4">
                Simple, secure, and straightforward onboarding
              </p>
            </motion.div>

            <StaggerContainer className="grid md:grid-cols-4 gap-8 lg:gap-12" staggerDelay={0.15}>
              {[
                { step: "1", title: "Create Your Account", desc: "Sign up with email verification. No credit card required.", icon: Users },
                { step: "2", title: "Verify Your Identity", desc: "Complete quick KYC verification to unlock all features.", icon: Shield },
                { step: "3", title: "Add Payment Methods", desc: "Connect your bank, card, or crypto wallet securely.", icon: CreditCard },
                { step: "4", title: "Start Transacting", desc: "Send, receive, and manage money instantly.", icon: Zap },
              ].map((item, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="text-center relative group"
                  >
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-300 via-blue-300 to-purple-400 -z-10">
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2"
                        >
                          <ArrowRight className="w-6 h-6 text-purple-500" />
                        </motion.div>
                      </div>
                    )}

                    <div className="relative mb-8">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 text-white rounded-3xl flex items-center justify-center text-4xl sm:text-5xl font-black mx-auto shadow-2xl group-hover:shadow-violet-500/50 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                        <span className="relative">{item.step}</span>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.2, rotate: -10 }}
                        className="absolute -top-3 -right-3 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-purple-200 group-hover:border-purple-400 transition-colors"
                      >
                        <item.icon className="w-7 h-7 text-purple-600 group-hover:text-purple-700 transition-colors" />
                      </motion.div>

                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        className="absolute inset-0 rounded-3xl border-2 border-purple-400 -z-10"
                      />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                      {item.desc}
                    </p>

                    <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.5, duration: 1 }}
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                      />
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* Trust & Security Section */}
        <AnimatedSection className="py-20 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StaggerContainer className="grid md:grid-cols-3 gap-8 text-center" staggerDelay={0.1}>
              <StaggerItem>
                <div className="text-5xl font-bold text-purple-400 mb-3">99.9%</div>
                <div className="text-gray-300 text-lg">Uptime Guarantee</div>
                <div className="text-gray-400 text-sm mt-2">Enterprise-grade infrastructure</div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-5xl font-bold text-green-400 mb-3">Bank-Grade</div>
                <div className="text-gray-300 text-lg">Security Standards</div>
                <div className="text-gray-400 text-sm mt-2">AES-256 encryption & compliance</div>
              </StaggerItem>
              <StaggerItem>
                <div className="text-5xl font-bold text-purple-400 mb-3">Global</div>
                <div className="text-gray-300 text-lg">Compliance Ready</div>
                <div className="text-gray-400 text-sm mt-2">GDPR, SOC 2, PCI-DSS certified</div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* 30-Day Guarantee */}
        <AnimatedSection className="py-16 bg-gradient-to-r from-green-50 to-blue-50 border-y" animation="scale">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-green-200"
            >
              <FloatingElement intensity="subtle">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6">
                  <Award className="w-10 h-10 text-white" />
                </div>
              </FloatingElement>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                30-Day Money-Back Guarantee
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Try Advancia Pay Ledger risk-free. If you&apos;re not completely satisfied within 30 days, we&apos;ll refund every penny.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                {["Full refund guaranteed", "No hidden fees", "Cancel anytime"].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Final CTA */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-800 text-white relative overflow-hidden">
          <ParticlesBackground variant="stars" className="opacity-50" />
          
          <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <FloatingElement intensity="medium">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <Sparkles className="w-20 h-20 sm:w-24 sm:h-24 text-yellow-300 relative" />
                </div>
              </FloatingElement>

              <motion.h2
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-tight font-display"
              >
                Ready to Transform{" "}
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300">
                  Your Finances?
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-10 md:mb-12 text-white/95 max-w-3xl mx-auto leading-relaxed font-medium px-4"
              >
                Join <span className="font-black text-yellow-300">10,000+</span> users who trust Advancia Pay Ledger for their financial needs.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 mb-10"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/auth/register"
                    className="group relative w-full sm:w-auto bg-white text-purple-700 px-10 sm:px-12 py-5 sm:py-6 rounded-2xl text-lg sm:text-xl font-black shadow-2xl hover:shadow-yellow-500/50 inline-flex items-center justify-center gap-3 border-4 border-yellow-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-pink-200/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </motion.div>
                    <span className="relative">Start Free Trial</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/pricing"
                    className="group w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 rounded-2xl text-lg sm:text-xl font-bold border-3 border-white/50 hover:bg-white/20 hover:border-white transition-all backdrop-blur-md shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-3"
                  >
                    <span>View Pricing</span>
                    <DollarSign className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm sm:text-base text-white/90 px-4"
              >
                {[
                  { icon: CheckCircle2, text: "No credit card required" },
                  { icon: Award, text: "30-day money-back guarantee" },
                  { icon: Shield, text: "Cancel anytime" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <item.icon className="w-5 h-5 text-yellow-300" />
                    <span className="font-semibold">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Customer Testimonials Section */}
        <AnimatedSection className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-200 rounded-full text-sm font-semibold text-yellow-700 uppercase tracking-wider">
                  ⭐ Customer Stories
                </span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 mb-4 sm:mb-6 font-display">
                Loved by Thousands
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Join 10,000+ businesses and individuals who trust Advancia Pay Ledger
              </p>
            </motion.div>

            <Testimonials
              autoRotate={true}
              autoRotateInterval={6000}
              className="mb-12"
            />

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            >
              {[
                { number: "10,000+", label: "Active Users", icon: "👥" },
                { number: "4.9/5", label: "Average Rating", icon: "⭐" },
                { number: "$500M+", label: "Transactions Processed", icon: "💰" },
                { number: "99.9%", label: "Uptime Guarantee", icon: "🚀" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div>
                <Logo size="lg" showText={true} variant="gradient" />
                <p className="text-gray-400 mt-4 leading-relaxed">
                  The most advanced fintech platform for secure payments, crypto trading, and real-time financial management.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">30-Day Money-Back Guarantee</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Product</h3>
                <ul className="space-y-3">
                  {["Features", "Pricing", "Dashboard", "Crypto Trading"].map((item) => (
                    <li key={item}>
                      <Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Company</h3>
                <ul className="space-y-3">
                  {["About Us", "Support", "FAQ", "Documentation"].map((item) => (
                    <li key={item}>
                      <Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Legal</h3>
                <ul className="space-y-3">
                  {["Privacy Policy", "Terms of Service", "Security", "Compliance"].map((item) => (
                    <li key={item}>
                      <Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Advancia Pay Ledger. All rights reserved.
              </p>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
                <Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return null;
}
