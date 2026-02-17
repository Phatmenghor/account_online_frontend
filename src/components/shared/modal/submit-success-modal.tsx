"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
}

export default function SubmitSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  description,
}: SuccessModalProps) {
  const translate = useTranslations("NIDPage");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Green top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />

            {/* Body */}
            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
              {/* Success icon with sparkles */}
              <div className="relative mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center shadow-lg shadow-green-200"
                >
                  <CheckCircle2 className="w-11 h-11 text-emerald-600" />
                </motion.div>
                {/* Sparkle decorations */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-1 -left-1"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"
              >
                {title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm sm:text-base text-gray-500 leading-relaxed mb-4"
              >
                {message}
              </motion.p>

              {/* Account number */}
              {description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="w-full bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 mb-5"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      {translate("account_number") || "Account Number"}
                    </p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 tracking-widest">
                    {description}
                  </p>
                </motion.div>
              )}

              {/* Close button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-green-200 transition-all"
                >
                  {translate("close") || "Close"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
