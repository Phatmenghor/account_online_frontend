"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DashboardBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [fireworks, setFireworks] = useState<any[]>([]);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [birthdayStatus, setBirthdayStatus] = useState<
    "before" | "within10days" | "today" | "after"
  >("before");

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

  // Countdown timer and birthday status checker
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const birthdayStart = new Date("2025-10-11T00:00:00");
      const birthdayEnd = new Date("2025-10-11T23:59:59");
      const tenDaysBefore = new Date("2025-10-01T00:00:00"); // 10 days before Oct 11

      // Check if it's the birthday
      if (now >= birthdayStart && now <= birthdayEnd) {
        setBirthdayStatus("today");
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
      // Check if birthday has passed
      else if (now > birthdayEnd) {
        setBirthdayStatus("after");
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
      // Check if within 10 days before birthday
      else if (now >= tenDaysBefore && now < birthdayStart) {
        setBirthdayStatus("within10days");
        const difference = birthdayStart.getTime() - now.getTime();

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
      // More than 10 days before birthday
      else {
        setBirthdayStatus("before");
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fireworks generator
  useEffect(() => {
    const createFirework = () => {
      const id = Math.random();
      const x = Math.random() * 100;
      const y = Math.random() * 60 + 10;
      const color = ["#f97316", "#a855f7", "#ec4899", "#fbbf24", "#06b6d4"][
        Math.floor(Math.random() * 5)
      ];

      setFireworks((prev) => [...prev, { id, x, y, color }]);

      setTimeout(() => {
        setFireworks((prev) => prev.filter((fw) => fw.id !== id));
      }, 2000);
    };

    const interval = setInterval(createFirework, 800);
    return () => clearInterval(interval);
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

      {/* Birthday Message Overlay */}
      {birthdayStatus !== "before" && birthdayStatus !== "after" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center px-8">
            {/* Main Birthday Message */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h1
                className="text-6xl md:text-8xl font-bold mb-8"
                style={{
                  background:
                    "linear-gradient(135deg, #f97316 0%, #a855f7 50%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 4px 20px rgba(251, 146, 60, 0.5))",
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Happy Birthday
              </motion.h1>
            </motion.div>

            {/* Show "to you Phat Menghor" only on birthday */}
            {birthdayStatus === "today" && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  <p
                    className="text-3xl md:text-4xl font-light text-white mb-6"
                    style={{
                      textShadow:
                        "0 2px 10px rgba(0, 0, 0, 0.3), 0 0 30px rgba(251, 146, 60, 0.5)",
                    }}
                  >
                    to you
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  <motion.h2
                    className="text-5xl md:text-7xl font-bold mb-8"
                    style={{
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0 4px 20px rgba(236, 72, 153, 0.6))",
                    }}
                    animate={{
                      scale: [1, 1.03, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    Phat Menghor
                  </motion.h2>
                </motion.div>
              </>
            )}

            {/* Date - only show on birthday */}
            {birthdayStatus === "today" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="inline-block"
              >
                <motion.div
                  className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/30"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(251, 146, 60, 0.3)",
                      "0 0 40px rgba(236, 72, 153, 0.5)",
                      "0 0 20px rgba(251, 146, 60, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <p
                    className="text-2xl md:text-3xl font-semibold text-white tracking-wider"
                    style={{
                      textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    11 - October - 2025
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Countdown Timer - only show within 10 days before birthday */}
            {birthdayStatus === "within10days" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.3 }}
                className="mt-8"
              >
                <p
                  className="text-xl md:text-2xl font-light text-white mb-4"
                  style={{
                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  Countdown to Birthday:
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  {[
                    { label: "Days", value: countdown.days },
                    { label: "Hours", value: countdown.hours },
                    { label: "Minutes", value: countdown.minutes },
                    { label: "Seconds", value: countdown.seconds },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="bg-white/25 backdrop-blur-lg px-6 py-4 rounded-xl border border-white/40"
                      animate={{
                        scale: item.label === "Seconds" ? [1, 1.05, 1] : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: item.label === "Seconds" ? Infinity : 0,
                      }}
                    >
                      <div
                        className="text-3xl md:text-4xl font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          textShadow: "0 0 20px rgba(251, 146, 60, 0.5)",
                        }}
                      >
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-sm md:text-base text-white/80 mt-1 font-medium">
                        {item.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

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

      {/* Fireworks */}
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute pointer-events-none"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
          }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            const radius = 80;
            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: firework.color,
                  boxShadow: `0 0 15px ${firework.color}`,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * radius,
                  y: Math.sin((angle * Math.PI) / 180) * radius,
                  scale: [0, 1, 0.5],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                }}
              />
            );
          })}
          {/* Center burst */}
          <motion.div
            className="absolute w-6 h-6 rounded-full -translate-x-3 -translate-y-3"
            style={{
              backgroundColor: firework.color,
              boxShadow: `0 0 30px ${firework.color}`,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 0.5, 0] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      ))}
    </div>
  );
}
