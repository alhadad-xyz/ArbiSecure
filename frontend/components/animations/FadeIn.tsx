"use client";

import { motion, useInView, UseInViewOptions } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    noVertical?: boolean;
    delay?: number;
    viewTriggerOffset?: boolean;
}

export const FadeIn = ({
    children,
    className,
    noVertical = false,
    delay = 0,
    viewTriggerOffset = false,
}: FadeInProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, {
        once: true,
        margin: viewTriggerOffset ? "-128px" : "0px",
    } as UseInViewOptions);

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                y: noVertical ? 0 : 24,
            }}
            animate={
                isInView
                    ? {
                        opacity: 1,
                        y: 0,
                    }
                    : {
                        opacity: 0,
                        y: noVertical ? 0 : 24,
                    }
            }
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98], // "Apple-like" ease
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const FadeInStagger = ({ children, className, faster = false }: { children: React.ReactNode; className?: string; faster?: boolean }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-64px" }}
            transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const FadeInStaggerItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.8,
                        ease: [0.21, 0.47, 0.32, 0.98],
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
