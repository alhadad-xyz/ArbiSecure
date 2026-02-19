"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import LandingHeader from "@/components/landing/LandingHeader";
import { useEffect, useState } from "react";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isConnected, isConnecting, isReconnecting } = useAccount();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!isMounted) return null;

    const isLoading = isConnecting || isReconnecting;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans selection:bg-white/20">
                {/* Background ambient blobs */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
                    <div className="absolute -bottom-40 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    <LandingHeader />
                    <div className="flex-grow flex flex-col items-center justify-center space-y-8 p-4 text-center">
                        <div className="space-y-4 max-w-md">
                            <h1 className="text-4xl md:text-5xl font-header font-bold">Access Restricted</h1>
                            <p className="text-gray-400 font-mono text-sm leading-relaxed">
                                You must connect your wallet to view your dashboard and manage deals.
                            </p>
                        </div>

                        <div className="scale-125 origin-top">
                            <ConnectButton showBalance={false} />
                        </div>
                    </div>
                    {/* Footer */}
                    <footer className="relative z-10 text-center py-8 border-t border-white/[0.06]">
                        <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                            Powered by{' '}
                            <span className="text-gray-400">ArbiSecure</span>{' '}
                            <span className="text-gray-700">·</span>{' '}
                            Arbitrum Stylus
                        </p>
                    </footer>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
