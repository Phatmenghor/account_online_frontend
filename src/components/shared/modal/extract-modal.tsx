"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export default function LoadingModal({
  isOpen,
  title = "Processing",
  message = "Please wait...",
}: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="relative bg-white w-full max-w-xs sm:max-w-sm rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />

            {/* Content */}
            <div className="flex flex-col items-center px-6 py-8 text-center">
              {/* Animated spinner ring */}
              <div className="relative w-20 h-20 mb-5">
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500"
                />
                {/* Inner ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-4 border-amber-100 border-b-amber-400"
                />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-4 h-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full"
                  />
                </div>
              </div>

              {/* Pulsing dots */}
              <div className="flex gap-1.5 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 bg-orange-400 rounded-full"
                  />
                ))}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
