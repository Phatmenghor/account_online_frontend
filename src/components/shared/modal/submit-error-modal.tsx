"use client";

import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, RefreshCcw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface SubmitErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
  variant?: "error" | "warning";
}

export default function SubmitErrorModal({
  isOpen,
  onClose,
  title,
  message,
  description,
  variant = "error",
}: SubmitErrorModalProps) {
  const translate = useTranslations("NIDPage");

  const isWarning = variant === "warning";
  const Icon = isWarning ? AlertTriangle : XCircle;

  const colors = isWarning
    ? {
        accent: "from-amber-400 via-yellow-500 to-orange-400",
        iconBg: "from-amber-400 to-orange-500",
        titleColor: "text-amber-700",
        primaryBtn: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      }
    : {
        accent: "from-red-400 via-red-500 to-rose-500",
        iconBg: "from-red-400 to-rose-600",
        titleColor: "text-red-700",
        primaryBtn: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${colors.accent}`} />

            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                className={`w-16 h-16 rounded-lg bg-gradient-to-br ${colors.iconBg} flex items-center justify-center mb-5 shadow-sm`}
              >
                <Icon className="text-white" style={{ width: 30, height: 30 }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-lg sm:text-xl font-bold ${colors.titleColor} mb-2`}
              >
                {title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm sm:text-base text-gray-500 leading-relaxed mb-7"
              >
                {message}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <Button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <X className="w-4 h-4" />
                  {translate("close") || "Close"}
                </Button>
                <Button
                  onClick={onClose}
                  className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${colors.primaryBtn} text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm`}
                >
                  <RefreshCcw className="w-4 h-4" />
                  {translate("try_again") || "Try Again"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
