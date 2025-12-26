"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ParticlesBackgroundProps {
  variant?: "hero" | "stars" | "bubbles";
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export default function ParticlesBackground({
  variant = "hero",
  className = "",
}: ParticlesBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = variant === "stars" ? 50 : 30;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    setParticles(newParticles);
  }, [variant]);

  const getParticleVariant = () => {
    switch (variant) {
      case "stars":
        return "⭐";
      case "bubbles":
        return "○";
      default:
        return "•";
    }
  };

  const getParticleColor = () => {
    switch (variant) {
      case "stars":
        return "text-yellow-300";
      case "bubbles":
        return "text-blue-300";
      default:
        return "text-white";
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${getParticleColor()}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size * 4}px`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: particle.speed + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.id * 0.1,
          }}
        >
          {getParticleVariant()}
        </motion.div>
      ))}
    </div>
  );
}
