"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DashboardBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {/* Outer decorative frame */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-4 rounded-3xl border-2 border-white/20 backdrop-blur-sm" />
        <div className="absolute inset-8 rounded-2xl border border-white/10" />
      </div>

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.4) 0%, transparent 60%)",
            "radial-gradient(circle at 80% 50%, rgba(192, 132, 252, 0.4) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.4) 0%, transparent 60%)",
            "radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.4) 0%, transparent 60%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Main background image with parallax and zoom effect */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 25 }}
      >
        <motion.div
          className="relative w-full h-full"
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <motion.div
            className="absolute rounded-lg inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/app/dashboard.png')`,
            }}
            animate={{
              filter: [
                "brightness(1) contrast(1.05) saturate(1.1)",
                "brightness(1.05) contrast(1.08) saturate(1.15)",
                "brightness(1) contrast(1.05) saturate(1.1)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Subtle vignette effect */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5" />
        </motion.div>
      </motion.div>

      {/* Floating particles effect */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: Math.random() * 8 + 3,
            height: Math.random() * 8 + 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            borderRadius: "16px",
            background:
              i % 3 === 0
                ? "rgba(251, 146, 60, 0.3)"
                : i % 3 === 1
                ? "rgba(192, 132, 252, 0.3)"
                : "rgba(236, 72, 153, 0.3)",
            boxShadow: "0 0 20px rgba(255, 255, 255, 0.5)",
          }}
          animate={{
            y: [0, -40 - Math.random() * 30, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Light beam effects */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%)",
          backgroundSize: "300% 300%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Pulsing corner glow effects */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/30 via-orange-300/20 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/30 via-purple-300/20 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-pink-400/20 via-pink-300/10 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Sparkle effects */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.8)",
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
            repeatDelay: Math.random() * 3 + 2,
          }}
        />
      ))}
    </div>
  );
}
