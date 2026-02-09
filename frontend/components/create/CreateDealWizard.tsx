"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassInput from "./GlassInput";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { parseEther } from "viem";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";

export default function CreateDealWizard() {
    const router = useRouter();
    const { address } = useAccount();
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

    // In a real app, we would wait for the transaction receipt to get the deal ID from logs
    // const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    //     hash,
    // });

    const [step, setStep] = useState(1);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        freelancer: "", // Freelancer wallet address (who gets paid)
        client: "", // Client wallet address (who will fund the deal)
        arbiter: ""
    });

    // Auto-populate freelancer address when wallet connects
    useEffect(() => {
        if (address && !formData.freelancer) {
            setFormData(prev => ({ ...prev, freelancer: address }));
        }
    }, [address, formData.freelancer]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => Math.max(1, prev - 1));

    const handleGenerateLink = async () => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        // Validate all fields
        if (!formData.title.trim()) {
            toast.error("Agreement title is required");
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error("Please enter a valid amount greater than 0");
            return;
        }

        if (!formData.freelancer.trim()) {
            toast.error("Freelancer wallet address is required");
            return;
        }

        // Validate freelancer address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(formData.freelancer)) {
            toast.error("Freelancer address is not a valid Ethereum address");
            return;
        }

        if (parseFloat(formData.amount) > 1000000) {
            toast.error("Amount cannot exceed 1,000,000 ETH");
            return;
        }

        if (!formData.client.trim()) {
            toast.error("Client wallet address is required");
            return;
        }

        // Validate client address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(formData.client)) {
            toast.error("Client address is not a valid Ethereum address");
            return;
        }

        if (formData.freelancer.toLowerCase() === formData.client.toLowerCase()) {
            toast.error("Freelancer and client cannot be the same address");
            return;
        }

        if (!formData.arbiter.trim()) {
            toast.error("Arbiter wallet address is required");
            return;
        }

        // Validate arbiter address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(formData.arbiter)) {
            toast.error("Arbiter address is not a valid Ethereum address");
            return;
        }

        if (formData.arbiter.toLowerCase() === formData.freelancer.toLowerCase()) {
            toast.error("Arbiter cannot be the same as freelancer");
            return;
        }

        if (formData.arbiter.toLowerCase() === formData.client.toLowerCase()) {
            toast.error("Arbiter cannot be the same as client");
            return;
        }

        try {
            setIsGenerating(true);

            // Call API to create deal and get UUID link
            const response = await fetch('/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    freelancer: formData.freelancer,
                    amount: formData.amount,
                    arbiter: formData.arbiter,
                    title: formData.title,
                    description: formData.description
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create deal');
            }

            const { dealId, link } = await response.json();

            // Copy to clipboard
            navigator.clipboard.writeText(link);

            // Trigger confetti!
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);

            toast.success("Link Copied!", {
                description: "Share this link with your client to fund the deal.",
                duration: 5000,
            });

        } catch (error) {
            console.error("Error generating link:", error);
            toast.error("Failed to generate link");
        } finally {
            setIsGenerating(false);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="w-full">
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.3}
                />
            )}
            {/* Step Indicator (Minimal) */}
            <div className="flex items-center gap-2 mb-12">
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-white shadow-[0_0_10px_-2px_rgba(255,255,255,0.5)]" : "bg-white/10"}`}
                    ></div>
                ))}
            </div>

            <div className="min-h-[300px] flex flex-col justify-between">
                <AnimatePresence mode="wait" custom={step}>
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            custom={step}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-header text-white">Initiate Agreement</h2>
                                <p className="text-gray-400 font-mono text-sm">Define the scope and deliverables.</p>
                            </div>

                            <GlassInput
                                label="Agreement Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Smart Contract Audit"
                                isHuge
                                autoFocus
                            />

                            <div className="relative group pt-4">
                                <textarea
                                    className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/20 focus:outline-none focus:border-white transition-all duration-300 py-2 font-mono text-sm min-h-[100px] resize-none"
                                    placeholder="Add a detailed description (optional)..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            custom={step}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-header text-white">Escrow Value</h2>
                                <p className="text-gray-400 font-mono text-sm">Specify the total amount to be secured.</p>
                            </div>

                            <div className="flex items-end gap-4">
                                <div className="flex-grow">
                                    <GlassInput
                                        label="Total Amount"
                                        value={formData.amount}
                                        type="number"
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        isHuge
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <span className="text-2xl font-header text-white/80">ETH</span>
                                </div>
                            </div>

                            <GlassInput
                                label="Freelancer Wallet Address"
                                value={formData.freelancer}
                                onChange={(e) => setFormData({ ...formData, freelancer: e.target.value })}
                                placeholder="0x... (who gets paid)"
                            />

                            <GlassInput
                                label="Client Wallet Address"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                placeholder="0x... (who will fund this deal)"
                            />

                            <p className="text-xs text-gray-500 font-mono">
                                * Protocol secures Native ETH on Arbitrum One/Sepolia.
                            </p>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            custom={step}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-header text-white">Dispute Resolution</h2>
                                <p className="text-gray-400 font-mono text-sm">Designate a neutral third party for security.</p>
                            </div>

                            <GlassInput
                                label="Arbiter Wallet Address"
                                value={formData.arbiter}
                                onChange={(e) => setFormData({ ...formData, arbiter: e.target.value })}
                                placeholder="0x..."
                                autoFocus
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFormData({ ...formData, arbiter: "0x1234567890123456789012345678901234567890" })}
                                    className="text-xs font-mono text-white/60 hover:text-white transition-colors border border-white/10 hover:border-white/40 rounded px-3 py-1"
                                >
                                    Use ArbiSecure Platform
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 font-mono bg-white/5 p-4 rounded-lg border border-white/10">
                                ℹ️ The arbiter holds the key to resolve disputes.
                                By selecting ArbiSecure, you agree to our dispute resolution terms.
                            </p>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            custom={step}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-header text-white">Review & Generate</h2>
                                <p className="text-gray-400 font-mono text-sm">Confirm details before creating the secure link.</p>
                            </div>

                            <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Agreement</label>
                                    <p className="text-xl font-header text-white">{formData.title}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Amount</label>
                                    <p className="text-2xl font-header text-white">{formData.amount} <span className="text-sm text-gray-400">ETH</span></p>
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Freelancer (Who gets paid)</label>
                                    <p className="font-mono text-sm text-gray-300 break-all">{formData.freelancer || "Not specified"}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Client (Who will fund)</label>
                                    <p className="font-mono text-sm text-gray-300 break-all">{formData.client || "Not specified"}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-gray-500 uppercase">Arbiter</label>
                                    <p className="font-mono text-sm text-gray-300 break-all">{formData.arbiter}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
                    <button
                        onClick={handleBack}
                        className={`text-sm font-mono text-gray-500 hover:text-white transition-colors ${step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                    >
                        ← Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={!formData.title && step === 1 || !formData.amount && step === 2 || !formData.arbiter && step === 3}
                            className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold font-nav hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleGenerateLink}
                            disabled={isGenerating}
                            className="w-full bg-white text-black py-4 rounded-full font-bold font-nav text-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] relative overflow-hidden group"
                        >
                            {isGenerating ? "Generating..." : "Generate & Copy Link"}
                            <div className="absolute inset-0 bg-white/40 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
