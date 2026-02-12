"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import LandingHeader from "@/components/landing/LandingHeader";
import { useRouter } from "next/navigation";

interface DealData {
    title: string;
    description: string;
    amount: string;
    freelancer: string;
    client: string;
    arbiter: string;
    milestones?: Array<{
        title: string;
        amount: string;
        percentage: number;
    }>;
}

interface DealReviewUIProps {
    dealData: DealData;
    dealId?: string; // UUID from the URL
}

export default function DealReviewUI({ dealData, dealId }: DealReviewUIProps) {
    const router = useRouter();
    // MOCK MODE: Bypass wallet connection for dev
    const MOCK_MODE = true;
    const { address: realAddress, isConnected: isRealConnected } = useAccount();
    const address = MOCK_MODE ? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" : realAddress;
    const isConnected = MOCK_MODE ? true : isRealConnected;

    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

    // Mock states for UI feedback
    const [mockPending, setMockPending] = useState(false);
    const [mockConfirmed, setMockConfirmed] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        console.log('[DealReviewUI] useEffect triggered', { isConfirmed, mockConfirmed, MOCK_MODE, dealId });

        if (isConfirmed || (MOCK_MODE && mockConfirmed)) {
            console.log('[DealReviewUI] Condition met, starting update');
            toast.success("Deal created and funded successfully!");

            // Update Supabase status from 'pending' to 'funded'
            const updateDealStatus = async () => {
                console.log('[DealReviewUI] updateDealStatus called for dealId:', dealId);
                if (dealId) {
                    console.log('[DealReviewUI] Calling API to update status...');

                    try {
                        const response = await fetch(`/api/deals/${dealId}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'funded' })
                        });

                        const data = await response.json();
                        console.log('[DealReviewUI] API result:', { ok: response.ok, data });

                        if (!response.ok) {
                            console.error('Failed to update deal status:', data.error);
                            toast.error('Failed to update deal status');
                            return;
                        }
                    } catch (error) {
                        console.error('[DealReviewUI] API call failed:', error);
                        toast.error('Failed to update deal status');
                        return;
                    }

                    console.log('[DealReviewUI] Update successful, starting transition');
                    // Trigger transition animation after successful update
                    setIsTransitioning(true);

                    // Hard reload after animation to force UI update with new data
                    setTimeout(() => {
                        console.log('[DealReviewUI] Reloading page to show updated UI');
                        window.location.reload();
                    }, 700); // Wait for curtain animation to complete
                }
            };

            updateDealStatus();
        }
    }, [isConfirmed, mockConfirmed, dealId, router]);

    useEffect(() => {
        if (isError) {
            console.error("Transaction error:", error);
            toast.error(`Transaction failed: ${error?.message || "Unknown error"}`);
        }
    }, [isError, error]);

    const handleCreateAndFund = () => {
        if (!isConnected || !address) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (MOCK_MODE) {
            setMockPending(true);
            setTimeout(() => {
                setMockPending(false);
                setMockConfirmed(true);
                // Toast and redirect are handled in useEffect
            }, 2000);
            return;
        }

        try {
            const parsedAmount = parseEther(dealData.amount);

            // Let wagmi/viem auto-estimate gas parameters for the current network
            // This prevents excessive fees on local devnet while still working on testnets
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "create_deal",
                args: [dealData.freelancer as `0x${string}`, parsedAmount, dealData.arbiter as `0x${string}`],
                value: parsedAmount,
            });
        } catch (error) {
            console.error("Error preparing transaction:", error);
            toast.error("Failed to prepare transaction. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans selection:bg-white/20">
            {/* Page Transition Curtain */}
            <AnimatePresence mode="wait">
                {isTransitioning && (
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

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
                <div className="absolute -bottom-40 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
            </div>


            <div className="relative z-10 flex flex-col min-h-screen">
                <LandingHeader />

                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        {/* The Monolith Container */}
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">
                            {/* Subtle internal sheen */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="inline-block px-4 py-1 mb-4 text-xs font-mono uppercase tracking-wider border border-white/20 rounded-full bg-white/5"
                                >
                                    Incoming Agreement
                                </motion.div>
                                <h1 className="text-4xl font-header font-bold mb-2">REVIEW & FUND</h1>
                                <p className="text-gray-400 font-mono text-xs">You have been invited to fund a secure escrow deal.</p>
                            </div>

                            {/* Deal Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="space-y-6 mb-10"
                            >
                                <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div>
                                        <label className="text-xs font-mono text-gray-500 uppercase">Agreement Title</label>
                                        <p className="text-xl font-header text-white mt-1">{dealData.title}</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-mono text-gray-500 uppercase">Description</label>
                                        <p className="text-sm text-gray-300 mt-1 font-mono leading-relaxed">{dealData.description || "No description provided."}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
                                        <div>
                                            <label className="text-xs font-mono text-gray-500 uppercase">Total Amount</label>
                                            <p className="text-2xl font-header text-white mt-1">{dealData.amount} <span className="text-sm text-gray-400">ETH</span></p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-mono text-gray-500 uppercase">Client (Funding)</label>
                                            <p className="font-mono text-xs text-gray-300 break-all mt-1">{dealData.client}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-mono text-gray-500 uppercase">Freelancer</label>
                                            <p className="font-mono text-xs text-gray-300 break-all mt-1">{dealData.freelancer}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-mono text-gray-500 uppercase">Arbiter</label>
                                            <p className="font-mono text-xs text-gray-300 break-all mt-1">{dealData.arbiter}</p>
                                        </div>
                                    </div>

                                    {/* Milestones Section */}
                                    {dealData.milestones && dealData.milestones.length > 0 && (
                                        <div className="pt-6 border-t border-white/10 space-y-4">
                                            <label className="text-xs font-mono text-gray-500 uppercase">Payment Milestones</label>

                                            {/* Progress Bar */}
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                                {dealData.milestones.map((milestone, index) => (
                                                    <div
                                                        key={index}
                                                        className="h-full bg-white/80 shadow-[0_0_8px_-2px_rgba(255,255,255,0.4)] transition-all"
                                                        style={{ width: `${milestone.percentage}%` }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Milestone List */}
                                            <div className="space-y-2">
                                                {dealData.milestones.map((milestone, index) => (
                                                    <div key={index} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-400 font-mono text-xs">
                                                            {index + 1}. {milestone.title}
                                                        </span>
                                                        <span className="text-white font-mono text-xs">
                                                            {milestone.amount} ETH ({milestone.percentage}%)
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Action Button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {!isConnected ? (
                                    <div className="flex justify-center w-full">
                                        <ConnectButton.Custom>
                                            {({ openConnectModal }) => (
                                                <button
                                                    onClick={openConnectModal}
                                                    className="w-full bg-white text-black font-header font-bold py-4 rounded-full hover:bg-gray-200 transition-all uppercase tracking-wider"
                                                >
                                                    Connect Wallet
                                                </button>
                                            )}
                                        </ConnectButton.Custom>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleCreateAndFund}
                                        disabled={isPending || isConfirming || mockPending}
                                        className="w-full bg-white text-black font-header font-bold py-4 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] relative overflow-hidden group"
                                    >
                                        {isPending || isConfirming || mockPending ? "CONFIRMING..." : "CREATE & FUND DEAL"}
                                        <div className="absolute inset-0 bg-white/40 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                                    </button>
                                )}
                            </motion.div>

                            <p className="text-[10px] text-gray-500 text-center mt-6 font-mono">
                                Powered by ArbiSecure Stylus • Trustless & Secure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
