"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

export function MaskText({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    const animation = {
        initial: { y: "100%" },
        enter: (i: number) => ({
            y: "0",
            transition: {
                duration: 0.75,
                ease: [0.33, 1, 0.68, 1] as any,
                delay: delay,
            },
        }),
    };

    // If children is a string, split by lines if needed, or just wrap it.
    // Ideally, pass lines as an array of strings or separate MaskText components.
    // For simplicity, we assume children is a single block or we wrap it all.
    // To support multi-line "reveal", the user should wrap each line in a generic div overflow-hidden and animate its content.
    // Here we provide a simple wrapper that animates the entire block up from a mask.

    return (
        <div ref={ref} className={`overflow-hidden ${className}`}>
            <motion.div variants={animation} initial="initial" animate={isInView ? "enter" : "initial"} custom={0}>
                {children}
            </motion.div>
        </div>
    );
}

// For multiple lines, we can use a helper that takes an array of phrases
export function MaskTextLines({ phrases, className, delay = 0 }: { phrases: string[]; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    const animation = {
        initial: { y: "100%" },
        enter: (i: number) => ({
            y: "0",
            transition: {
                duration: 0.9,
                ease: [0.33, 1, 0.68, 1] as any,
                delay: 0.1 * i + delay,
            },
        }),
    };

    return (
        <div ref={ref} className={className}>
            {phrases.map((phrase, index) => (
                <div key={index} className="overflow-hidden">
                    <motion.div variants={animation} initial="initial" animate={isInView ? "enter" : "initial"} custom={index} className="inline-block">
                        {phrase}
                    </motion.div>
                </div>
            ))}
        </div>
    );
}

export function SplitText({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    const words = children.split(" ");

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.04 * i + delay },
        }),
    };

    const child: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={`flex flex-wrap ${className}`}
        >
            {words.map((word, index) => (
                <motion.span variants={child} key={index} className="mr-1.5 last:mr-0 inline-block">
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
