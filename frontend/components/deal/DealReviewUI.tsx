"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LandingHeader from "@/components/landing/LandingHeader";

interface DealData {
    title: string;
    description: string;
    amount: string;
    freelancer: string;
    arbiter: string;
}

interface DealReviewUIProps {
    dealData: DealData;
}

export default function DealReviewUI({ dealData }: DealReviewUIProps) {
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Deal created and funded successfully!");
        }
    }, [isConfirmed]);

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

        try {
            const parsedAmount = parseEther(dealData.amount);

            // Set explicit gas parameters to avoid \"max fee less than base fee\" error
            // Arbitrum Sepolia typically has base fee around 20 Gwei, so we set higher
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "create_deal",
                args: [dealData.freelancer as `0x${string}`, parsedAmount, dealData.arbiter as `0x${string}`],
                value: parsedAmount,
                maxFeePerGas: 100000000n, // 100 Gwei (safe buffer)
                maxPriorityFeePerGas: 1000000n, // 0.001 Gwei priority fee
            });
        } catch (error) {
            console.error("Error preparing transaction:", error);
            toast.error("Failed to prepare transaction. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans selection:bg-white/20">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
                <div className="absolute -bottom-40 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
            </div>

            <div className="relative z-10">
                <LandingHeader />

                <div className="container mx-auto px-6 py-20 max-w-3xl">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-block px-4 py-1 mb-4 text-xs font-mono uppercase tracking-wider border border-white/20 rounded-full bg-white/5"
                        >
                            Incoming Agreement
                        </motion.div>
                        <h1 className="text-5xl font-header font-bold mb-4">REVIEW & FUND</h1>
                        <p className="text-gray-400 font-mono text-sm">You have been invited to fund a secure escrow deal.</p>
                    </div>

                    {/* Deal Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 mb-8"
                    >
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-mono text-gray-500 uppercase">Agreement Title</label>
                                <p className="text-2xl font-header text-white mt-1">{dealData.title}</p>
                            </div>

                            <div>
                                <label className="text-xs font-mono text-gray-500 uppercase">Description</label>
                                <p className="text-sm text-gray-300 mt-1 font-mono leading-relaxed">{dealData.description || "No description provided."}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Total Amount</label>
                                    <p className="text-3xl font-header text-white mt-1">{dealData.amount} <span className="text-lg text-gray-400">ETH</span></p>
                                </div>

                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Freelancer</label>
                                    <p className="font-mono text-xs text-gray-300 break-all mt-1">{dealData.freelancer}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Arbiter (Dispute Resolver)</label>
                                    <p className="font-mono text-xs text-gray-300 break-all mt-1">{dealData.arbiter}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {!isConnected ? (
                            <div className="flex justify-center">
                                <ConnectButton />
                            </div>
                        ) : (
                            <button
                                onClick={handleCreateAndFund}
                                disabled={isPending || isConfirming}
                                className="w-full bg-white text-black font-header font-bold py-4 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                            >
                                {isPending || isConfirming ? "CONFIRMING IN WALLET..." : "CREATE & FUND DEAL"}
                            </button>
                        )}
                    </motion.div>

                    <p className="text-xs text-gray-500 text-center mt-6 font-mono">
                        Powered by ArbiSecure Stylus + Trustless & Secure
                    </p>
                </div>
            </div>
        </div>
    );
}
