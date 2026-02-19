"use client";

import { motion, AnimatePresence } from "framer-motion";

interface WhiteCurtainLoaderProps {
    isLoading: boolean;
    children: React.ReactNode;
}

export default function WhiteCurtainLoader({ isLoading, children }: WhiteCurtainLoaderProps) {
    return (
        <>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="fixed inset-0 z-50 bg-white flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-center space-y-4"
                        >
                            <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full mx-auto"></div>
                            <p className="text-black font-mono text-sm">Loading...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
}
