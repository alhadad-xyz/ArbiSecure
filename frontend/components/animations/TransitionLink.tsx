"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TransitionLink({
    href,
    children,
    className,
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsNavigating(true);

        // Navigate during animation, not after
        setTimeout(() => {
            router.push(href);
        }, 400);

        // Keep curtain visible longer to prevent flicker
        setTimeout(() => {
            setIsNavigating(false);
        }, 1000);
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isNavigating && (
                    <motion.div
                        key="exit-curtain"
                        className="fixed left-0 bottom-0 w-full h-[100vh] bg-white z-[200] origin-bottom pointer-events-none"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{
                            duration: 0.7,
                            ease: [0.76, 0, 0.24, 1]
                        }}
                    />
                )}
            </AnimatePresence>
            <a href={href} onClick={handleClick} className={className}>
                {children}
            </a>
        </>
    );
}
