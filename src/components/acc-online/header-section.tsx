"use client";

import { motion } from "framer-motion";
import { Trash2, FileText, BadgeCheck } from "lucide-react";

interface HeaderSectionProps {
  title: string;
  onClear: () => void;
  translate: (key: string) => string;
}

export const HeaderSection = ({
  title,
  onClear,
  translate,
}: HeaderSectionProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-3"
      >
        {/* Left side */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon block */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0 mt-0.5">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight leading-tight">
                {title}
              </h1>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full border border-orange-200"
              >
                <BadgeCheck className="w-3 h-3" />
                {translate("cpbank_acc")}
              </motion.span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-xs sm:text-sm text-gray-400 leading-relaxed"
            >
              {translate("sub_header_acc")}
            </motion.p>
          </div>
        </div>

        {/* Clear Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClear}
          className="group flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 shadow-sm"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>{translate("clear")}</span>
        </motion.button>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        className="origin-left h-0.5 bg-gradient-to-r from-orange-400 via-orange-300 to-transparent rounded-full mt-4 mb-6 sm:mb-8"
      />
    </div>
  );
};
