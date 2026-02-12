"use client";

import { motion } from "framer-motion";

export default function Transition({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Curtain overlay - reveals from top on enter */}
            <motion.div
                className="fixed left-0 top-0 w-full h-[100vh] bg-white z-[100] origin-top pointer-events-none"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                exit={{ scaleY: 0 }}
                transition={{
                    duration: 0.7,
                    ease: [0.76, 0, 0.24, 1],
                    delay: 0
                }}
            />

            {/* Content - fades in after curtain reveals */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{
                    duration: 0.4,
                    delay: 0.3
                }}
            >
                {children}
            </motion.div>
        </>
    );
}
