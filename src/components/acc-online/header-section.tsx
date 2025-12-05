"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

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
        <div className="mb-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex items-center justify-between border-l-4 border-orange-500 pl-6 py-3"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                            {title}
                        </h1>
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full"
                        >
                            CPbank Account
                        </motion.span>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-sm text-gray-500"
                    >
                        Please ensure all information is accurate before submission
                    </motion.p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClear}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors duration-200 shadow-sm hover:shadow"
                >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{translate("clear")}</span>
                </motion.button>
            </motion.div>
        </div>
    );
};
