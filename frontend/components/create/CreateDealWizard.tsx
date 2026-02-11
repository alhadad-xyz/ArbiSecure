"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassInput from "./GlassInput";
import MilestoneBuilder from "./MilestoneBuilder";
import ConditionConfigurator from "./ConditionConfigurator";
import { QRCodeSVG } from "qrcode.react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { parseEther } from "viem";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { DealFormData, Milestone, generateMilestoneId, validateMilestones } from "@/lib/types";

export default function CreateDealWizard() {
    const router = useRouter();
    // MOCK MODE: Bypass wallet connection for dev
    const MOCK_MODE = true;
    const { address: realAddress } = useAccount();
    const address = MOCK_MODE ? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" : realAddress;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

    // In a real app, we would wait for the transaction receipt to get the deal ID from logs
    // const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    //     hash,
    // });

    const [step, setStep] = useState(1);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0); // Track which milestone we're configuring
    const [formData, setFormData] = useState<DealFormData>({
        title: "",
        description: "",
        totalAmount: "",
        freelancer: "", // Freelancer wallet address (who gets paid)
        client: "", // Client wallet address (who will fund the deal)
        arbiter: "",
        milestones: [
            // Default: single milestone with 100%
            {
                id: generateMilestoneId(),
                title: "Full Payment",
                percentage: 100,
                amount: "0",
                conditions: []
            }
        ]
    });

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

        if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
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

        if (parseFloat(formData.totalAmount) > 1000000) {
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

        // Validate milestones
        const validation = validateMilestones(formData.milestones);
        if (!validation.isValid) {
            toast.error(validation.errors[0]); // Show first error
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
                    client: formData.client,
                    amount: formData.totalAmount, // Backward compat: API uses 'amount'
                    totalAmount: formData.totalAmount,
                    arbiter: formData.arbiter,
                    title: formData.title,
                    description: formData.description,
                    milestones: formData.milestones // V3: Include milestone data
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || 'Failed to create deal');
            }

            const { dealId, link } = await response.json();

            // Store the generated link
            setGeneratedLink(link);

            // Trigger confetti!
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);

            // Move to success step (step 7)
            setStep(7);

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
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${s === step
                            ? "bg-white shadow-[0_0_20px_0px_rgba(255,255,255,0.8)]" // Current step - bright glow
                            : s < step
                                ? "bg-white/80 shadow-[0_0_8px_-2px_rgba(255,255,255,0.4)]" // Completed steps
                                : "bg-white/10" // Future steps
                            }`}
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

                            {/* Navigation */}
                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.title.trim()}
                                    className="px-8 py-3 bg-white text-black font-mono text-sm rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
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
                                        value={formData.totalAmount}
                                        type="number"
                                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
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

                            {/* Navigation */}
                            <div className="flex justify-between pt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-3 bg-white/10 text-white font-mono text-sm rounded-lg hover:bg-white/20 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.totalAmount || parseFloat(formData.totalAmount) <= 0}
                                    className="px-8 py-3 bg-white text-black font-mono text-sm rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
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
                                <h2 className="text-3xl font-header text-white">Payment Milestones</h2>
                                <p className="text-gray-400 font-mono text-sm">Break down the payment into stages.</p>
                            </div>

                            <MilestoneBuilder
                                totalAmount={formData.totalAmount}
                                milestones={formData.milestones}
                                onChange={(milestones) => {
                                    // Recalculate amounts for all milestones
                                    const updated = milestones.map(m => ({
                                        ...m,
                                        amount: ((parseFloat(formData.totalAmount) || 0) * m.percentage / 100).toFixed(4)
                                    }));
                                    setFormData({ ...formData, milestones: updated });
                                }}
                            />

                            {/* Navigation */}
                            <div className="flex justify-between pt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-3 bg-white/10 text-white font-mono text-sm rounded-lg hover:bg-white/20 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!validateMilestones(formData.milestones).isValid}
                                    className="px-8 py-3 bg-white text-black font-mono text-sm rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
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
                                <h2 className="text-3xl font-header text-white">Release Conditions</h2>
                                <p className="text-gray-400 font-mono text-sm">Set criteria for releasing each milestone payment.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Milestone selector */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                    {formData.milestones.map((milestone, index) => (
                                        <button
                                            key={milestone.id}
                                            onClick={() => setCurrentMilestoneIndex(index)}
                                            className={`px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap transition-all ${currentMilestoneIndex === index
                                                ? 'bg-white text-black'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            #{index + 1} {milestone.title}
                                        </button>
                                    ))}
                                </div>

                                {/* Condition configurator for selected milestone */}
                                <ConditionConfigurator
                                    milestoneIndex={currentMilestoneIndex}
                                    milestoneName={formData.milestones[currentMilestoneIndex]?.title || ''}
                                    conditions={formData.milestones[currentMilestoneIndex]?.conditions || []}
                                    onChange={(conditions) => {
                                        const updatedMilestones = formData.milestones.map((m, i) =>
                                            i === currentMilestoneIndex ? { ...m, conditions } : m
                                        );
                                        setFormData({ ...formData, milestones: updatedMilestones });
                                    }}
                                />
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-3 bg-white/10 text-white font-mono text-sm rounded-lg hover:bg-white/20 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 bg-white text-black font-mono text-sm rounded-lg hover:bg-white/90 transition-all"
                                >
                                    Next →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div
                            key="step5"
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

                            {/* Navigation */}
                            <div className="flex justify-between pt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-3 bg-white/10 text-white font-mono text-sm rounded-lg hover:bg-white/20 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 bg-white text-black font-mono text-sm rounded-lg hover:bg-white/90 transition-all"
                                >
                                    Review →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 6 && (
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
                                <h2 className="text-3xl font-header text-white">Review & Confirm</h2>
                                <p className="text-gray-400 font-mono text-sm">Double-check the details before creating your escrow deal.</p>
                            </div>

                            <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-gray-400 font-mono text-xs uppercase">Agreement</span>
                                    <span className="text-white font-header">{formData.title}</span>
                                </div>
                                {formData.description && (
                                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                        <span className="text-gray-400 font-mono text-xs uppercase">Description</span>
                                        <span className="text-white text-sm max-w-xs text-right">{formData.description}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-gray-400 font-mono text-xs uppercase">Total Amount</span>
                                    <span className="text-white font-header text-2xl">{formData.totalAmount} ETH</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-gray-400 font-mono text-xs uppercase">Client</span>
                                    <span className="text-white font-mono text-xs">{formData.client}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                    <span className="text-gray-400 font-mono text-xs uppercase">Freelancer</span>
                                    <span className="text-white font-mono text-xs">{formData.freelancer}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-mono text-xs uppercase">Arbiter</span>
                                    <span className="text-white font-mono text-xs">{formData.arbiter || "Platform Arbiter"}</span>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-6">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-3 bg-white/10 text-white font-mono text-sm rounded-lg hover:bg-white/20 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleGenerateLink}
                                    disabled={isGenerating}
                                    className="px-8 py-3 bg-white text-black font-mono text-sm rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? 'Generating...' : '✨ Generate Deal Link'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 7 && generatedLink && (
                        <motion.div
                            key="step5"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            custom={step}
                            className="space-y-8"
                        >
                            <div className="space-y-2 text-center">
                                <h2 className="text-3xl font-header text-white">Deal Created! 🎉</h2>
                                <p className="text-gray-400 font-mono text-sm">Share this link with your client to fund the escrow.</p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="bg-white p-6 rounded-2xl shadow-2xl">
                                    <QRCodeSVG
                                        value={generatedLink}
                                        size={256}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                            </div>

                            {/* Link Display */}
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-gray-400 font-mono text-xs uppercase mb-2">Deal Link</p>
                                <p className="text-white font-mono text-sm break-all">{generatedLink}</p>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedLink);
                                    toast.success("Link copied to clipboard!");
                                }}
                                className="w-full bg-white text-black py-4 rounded-full font-bold font-nav text-lg hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] relative overflow-hidden group"
                            >
                                <span className="relative z-10">Copy Link</span>
                                <div className="absolute inset-0 bg-white/40 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                            </button>

                            {/* Back to Home */}
                            <div className="text-center pt-4">
                                <button
                                    onClick={() => router.push('/')}
                                    className="text-gray-400 hover:text-white font-mono text-sm transition-colors"
                                >
                                    ← Back to Home
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
