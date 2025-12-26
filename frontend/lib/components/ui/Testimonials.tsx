"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

interface TestimonialsProps {
  autoRotate?: boolean;
  autoRotateInterval?: number;
  className?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    company: "TechStart Inc.",
    role: "CEO",
    content: "Advancia Pay Ledger transformed our financial operations. The real-time analytics and instant payments have saved us countless hours.",
    rating: 5,
    avatar: "👩‍💼",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    company: "Global Ventures",
    role: "CFO",
    content: "The security features are outstanding. Bank-grade encryption gives us peace of mind for all our transactions.",
    rating: 5,
    avatar: "👨‍💻",
  },
  {
    id: 3,
    name: "Emily Watson",
    company: "Digital Solutions",
    role: "Finance Director",
    content: "Best financial platform we have used. The AI-powered insights helped us optimize our spending by 30%.",
    rating: 5,
    avatar: "👩‍🔬",
  },
  {
    id: 4,
    name: "David Kim",
    company: "Innovation Labs",
    role: "Founder",
    content: "From setup to daily use, everything is intuitive. The customer support team is also incredibly responsive.",
    rating: 5,
    avatar: "👨‍🚀",
  },
];

export default function Testimonials({
  autoRotate = false,
  autoRotateInterval = 5000,
  className = "",
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, autoRotateInterval]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className={`relative ${className}`}>
      <motion.div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full opacity-50 transform translate-x-16 -translate-y-16" />
            
            {/* Quote icon */}
            <div className="relative mb-6">
              <Quote className="w-12 h-12 text-purple-600 opacity-20" />
            </div>

            {/* Content */}
            <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8 relative">
              &ldquo;{currentTestimonial.content}&rdquo;
            </blockquote>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                />
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-2xl">
                {currentTestimonial.avatar}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">
                  {currentTestimonial.name}
                </div>
                <div className="text-purple-600 font-medium">
                  {currentTestimonial.role}
                </div>
                <div className="text-gray-500 text-sm">
                  {currentTestimonial.company}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-purple-600 scale-125"
                  : "bg-gray-300 hover:bg-purple-300"
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
