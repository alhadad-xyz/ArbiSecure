"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LandingHeader from "@/components/landing/LandingHeader";

// Authorized tester addresses - add your wallet addresses here
const AUTHORIZED_TESTERS = [
    "0xf7E8f9889Ab6B96443cE6acd31B3001B5aD4eCAA", // Example - replace with actual addresses
    // Add more authorized addresses here
];

export default function TestingPage() {
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [testData, setTestData] = useState({
        freelancer: "",
        amount: "",
        arbiter: "",
        dealId: "",
    });

    // Check if user is authorized
    const isAuthorized = address && AUTHORIZED_TESTERS.map(a => a.toLowerCase()).includes(address.toLowerCase());

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Transaction Confirmed!", {
                description: "Check the console for transaction details.",
                duration: 5000,
            });
            console.log("Transaction hash:", hash);
        }
        if (writeError) {
            toast.error("Transaction Failed", {
                description: writeError.message
            });
        }
    }, [isConfirmed, writeError, hash]);

    // Test functions
    const handleCreateDeal = () => {
        if (!testData.freelancer || !testData.amount || !testData.arbiter) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            const parsedAmount = parseEther(testData.amount);
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "create_deal",
                args: [testData.freelancer as `0x${string}`, parsedAmount, testData.arbiter as `0x${string}`],
                value: parsedAmount,
            });
        } catch (error) {
            console.error("Error:", error);
            toast.error("Invalid input");
        }
    };

    const handleReleaseFunds = () => {
        if (!testData.dealId) {
            toast.error("Please enter deal ID");
            return;
        }

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "release",
                args: [BigInt(testData.dealId)],
            });
        } catch (error) {
            console.error("Error:", error);
            toast.error("Invalid deal ID");
        }
    };

    const handleDispute = () => {
        if (!testData.dealId) {
            toast.error("Please enter deal ID");
            return;
        }

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "dispute",
                args: [BigInt(testData.dealId)],
            });
        } catch (error) {
            console.error("Error:", error);
            toast.error("Invalid deal ID");
        }
    };

    // Access denied UI
    if (!isConnected) {
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col min-h-screen">
                    <LandingHeader />
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center space-y-6">
                            <div className="text-6xl">🔒</div>
                            <h1 className="text-4xl font-header">Testing Panel</h1>
                            <p className="text-gray-400 max-w-md">Connect your wallet to access the testing interface.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col min-h-screen">
                    <LandingHeader />
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center space-y-6">
                            <div className="text-6xl">⛔</div>
                            <h1 className="text-4xl font-header">Access Denied</h1>
                            <p className="text-gray-400 max-w-md">Your wallet address is not authorized to access this testing panel.</p>
                            <p className="text-xs font-mono text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Authorized testing UI
    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans selection:bg-white/20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <LandingHeader />

                <div className="flex-grow pt-20 pb-20 px-4 md:px-0 max-w-4xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-mono text-green-400">
                                ⚡ AUTHORIZED TESTER
                            </span>
                            <h1 className="text-4xl md:text-5xl font-header text-white">
                                Contract Testing Panel
                            </h1>
                            <p className="text-gray-400 font-mono text-sm">
                                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                        </div>

                        {/* Contract Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                            <h3 className="text-sm font-mono text-gray-500 uppercase">Contract Address</h3>
                            <p className="text-white font-mono text-sm break-all">{CONTRACT_ADDRESS}</p>
                        </div>

                        {/* Test Functions */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Create Deal */}
                            <div className="bg-glass border border-glass-border p-6 rounded-2xl space-y-4">
                                <h2 className="text-2xl font-header">Create Deal</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-mono text-gray-500 uppercase block mb-1">Freelancer Address</label>
                                        <input
                                            type="text"
                                            placeholder="0x..."
                                            value={testData.freelancer}
                                            onChange={(e) => setTestData({ ...testData, freelancer: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-mono text-gray-500 uppercase block mb-1">Amount (ETH)</label>
                                        <input
                                            type="text"
                                            placeholder="1.5"
                                            value={testData.amount}
                                            onChange={(e) => setTestData({ ...testData, amount: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-mono text-gray-500 uppercase block mb-1">Arbiter Address</label>
                                        <input
                                            type="text"
                                            placeholder="0x..."
                                            value={testData.arbiter}
                                            onChange={(e) => setTestData({ ...testData, arbiter: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateDeal}
                                        disabled={isPending || isConfirming}
                                        className="w-full bg-green-500 text-black py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-all disabled:opacity-50"
                                    >
                                        {isPending || isConfirming ? "Processing..." : "Create Deal"}
                                    </button>
                                </div>
                            </div>

                            {/* Release Funds */}
                            <div className="bg-glass border border-glass-border p-6 rounded-2xl space-y-4">
                                <h2 className="text-2xl font-header">Release Funds</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-mono text-gray-500 uppercase block mb-1">Deal ID</label>
                                        <input
                                            type="text"
                                            placeholder="0"
                                            value={testData.dealId}
                                            onChange={(e) => setTestData({ ...testData, dealId: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/30"
                                        />
                                    </div>
                                    <button
                                        onClick={handleReleaseFunds}
                                        disabled={isPending || isConfirming}
                                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-400 transition-all disabled:opacity-50"
                                    >
                                        {isPending || isConfirming ? "Processing..." : "Release"}
                                    </button>
                                </div>
                            </div>

                            {/* Dispute */}
                            <div className="bg-glass border border-glass-border p-6 rounded-2xl space-y-4">
                                <h2 className="text-2xl font-header">Dispute Deal</h2>
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-500">Uses the Deal ID from above</p>
                                    <button
                                        onClick={handleDispute}
                                        disabled={isPending || isConfirming}
                                        className="w-full bg-red-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-400 transition-all disabled:opacity-50"
                                    >
                                        {isPending || isConfirming ? "Processing..." : "Initiate Dispute"}
                                    </button>
                                </div>
                            </div>

                            {/* Transaction Status */}
                            <div className="bg-glass border border-glass-border p-6 rounded-2xl space-y-4">
                                <h2 className="text-2xl font-header">Status</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Pending:</span>
                                        <span className={isPending ? "text-yellow-400" : "text-gray-600"}>
                                            {isPending ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Confirming:</span>
                                        <span className={isConfirming ? "text-yellow-400" : "text-gray-600"}>
                                            {isConfirming ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Confirmed:</span>
                                        <span className={isConfirmed ? "text-green-400" : "text-gray-600"}>
                                            {isConfirmed ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    {hash && (
                                        <div className="pt-2 border-t border-white/10">
                                            <p className="text-xs text-gray-500 mb-1">Last TX Hash:</p>
                                            <p className="text-xs font-mono text-white break-all">{hash}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                            <p className="text-yellow-400 text-sm font-mono">
                                ⚠️ <strong>Warning:</strong> This is a testing interface. Only use testnet funds. All transactions are real on-chain operations.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
