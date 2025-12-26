"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface FeatureFlipCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  borderColor: string;
  emoji: string;
  benefits: string[];
}

export function FeatureFlipCard({
  icon,
  title,
  description,
  gradient,
  iconBg,
  borderColor,
  emoji,
  benefits,
}: FeatureFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-80 perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front Side */}
        <div className={`absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border-2 border-gray-200 ${borderColor} transition-all duration-300 backface-hidden p-6 flex flex-col items-center text-center`}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
          >
            {icon}
          </motion.div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 leading-relaxed flex-1">{description}</p>
          
          <div className="mt-4 text-4xl">{emoji}</div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
            Hover for details
          </div>
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${gradient} rounded-2xl shadow-xl border-2 border-gray-200 backface-hidden rotate-y-180 p-6 flex flex-col text-white`}>
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">{emoji}</div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold mb-4 text-white/90">Key Benefits:</h4>
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <div className="text-xs text-white/70">Enterprise Ready</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
