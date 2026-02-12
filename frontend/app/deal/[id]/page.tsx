"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import LandingHeader from "@/components/landing/LandingHeader";
import DealReviewUI from "@/components/deal/DealReviewUI";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import type { Deal } from "@/lib/supabase";

// Status enum matching contract
const DealStatus = {
    0: "Pending",
    1: "Funded",
    2: "Released",
    3: "Disputed",
    4: "Resolved"
} as const;

const StatusBadge = ({ status }: { status: keyof typeof DealStatus }) => {
    const statusConfig = {
        0: { emoji: "🟡", text: "Pending", color: "text-yellow-400" },
        1: { emoji: "🟢", text: "Funded", color: "text-green-400" },
        2: { emoji: "✅", text: "Released", color: "text-blue-400" },
        3: { emoji: "🔴", text: "Disputed", color: "text-red-400" },
        4: { emoji: "🎉", text: "Resolved", color: "text-purple-400" }
    };

    const config = statusConfig[status] || statusConfig[0];

    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm">
            <span className="text-xl">{config.emoji}</span>
            <span className={`font-mono text-sm uppercase tracking-wider ${config.color}`}>
                {config.text}
            </span>
        </div>
    );
};

export default function DealPage() {
    const params = useParams();
    const router = useRouter();
    const { address } = useAccount();

    // State
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dealId, setDealId] = useState<bigint | null>(null);

    // Fetch deal metadata from Supabase
    useEffect(() => {
        if (!params.id) return;

        const fetchDeal = async () => {
            try {
                const response = await fetch(`/api/deals/${params.id}`);
                if (!response.ok) {
                    throw new Error('Deal not found');
                }
                const data = await response.json();
                setDeal(data);

                // Extract deal ID from metadata (stored when deal was created)
                if (data.deal_id) {
                    setDealId(BigInt(data.deal_id));
                }
            } catch (err) {
                console.error('Error fetching deal:', err);
                setError('Deal not found');
            } finally {
                setLoading(false);
            }
        };

        fetchDeal();
    }, [params.id]);

    // Read contract state (only if we have a deal ID)
    const { data: contractStatus } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "get_deal_status",
        args: dealId ? [dealId] : undefined,
        query: { enabled: !!dealId }
    });

    const { data: contractClient } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "get_deal_client",
        args: dealId ? [dealId] : undefined,
        query: { enabled: !!dealId }
    });

    const { data: contractFreelancer } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "get_deal_freelancer",
        args: dealId ? [dealId] : undefined,
        query: { enabled: !!dealId }
    });

    const { data: contractArbiter } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "get_deal_arbiter",
        args: dealId ? [dealId] : undefined,
        query: { enabled: !!dealId }
    });

    const status = contractStatus !== undefined ? Number(contractStatus) as keyof typeof DealStatus : 0;

    // Contract write functions
    const { writeContract: release, data: releaseHash } = useWriteContract();
    const { writeContract: initiateDispute, data: disputeHash } = useWriteContract();
    const { writeContract: resolveDispute, data: resolveHash } = useWriteContract();

    // Wait for transactions
    const { isSuccess: isReleaseSuccess } = useWaitForTransactionReceipt({ hash: releaseHash });
    const { isSuccess: isDisputeSuccess } = useWaitForTransactionReceipt({ hash: disputeHash });
    const { isSuccess: isResolveSuccess } = useWaitForTransactionReceipt({ hash: resolveHash });

    // Handle transaction success
    useEffect(() => {
        if (isReleaseSuccess) {
            toast.success("✅ Funds released successfully!");
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isReleaseSuccess]);

    useEffect(() => {
        if (isDisputeSuccess) {
            toast.success("⚠️ Dispute initiated. Arbiter has been notified.");
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isDisputeSuccess]);

    useEffect(() => {
        if (isResolveSuccess) {
            toast.success("⚖️ Dispute resolved!");
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isResolveSuccess]);

    // Action handlers
    const handleRelease = () => {
        if (!dealId) return;
        release({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "release",
            args: [dealId]
        });
    };

    const handleInitiateDispute = () => {
        if (!dealId) return;
        initiateDispute({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "initiate_dispute",
            args: [dealId]
        });
    };

    const handleResolve = (releaseToFreelancer: boolean) => {
        if (!dealId) return;
        resolveDispute({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "arbiter_resolve",
            args: [dealId, releaseToFreelancer]
        });
    };

    // Determine user role
    const isClient = address && contractClient && address.toLowerCase() === (contractClient as string).toLowerCase();
    const isFreelancer = address && contractFreelancer && address.toLowerCase() === (contractFreelancer as string).toLowerCase();
    const isArbiter = address && contractArbiter && address.toLowerCase() === (contractArbiter as string).toLowerCase();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white font-mono bg-[#0a0a0a]">
                <div className="text-center space-y-4">
                    <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto"></div>
                    <p>Loading Deal...</p>
                </div>
            </div>
        );
    }

    if (error || !deal) {
        return (
            <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col min-h-screen">
                    <LandingHeader />
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-header">Deal Not Found</h1>
                            <p className="text-gray-400">This deal link may be invalid or expired.</p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 px-6 py-3 bg-white text-black font-header font-bold rounded-full hover:bg-gray-200 transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If deal status is 'pending', show funding UI
    // Once funded, show deal management UI
    if (deal.status === 'pending') {
        const dealData = {
            title: deal.title,
            description: deal.description,
            amount: deal.amount,
            freelancer: deal.freelancer,
            client: deal.client || address as string,
            arbiter: deal.arbiter,
            milestones: deal.milestones,
        };

        return <DealReviewUI dealData={dealData} dealId={params.id as string} />;
    }

    // Otherwise, show the deal management UI


    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans">
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

                            {/* Header */}
                            <div className="text-center mb-8">
                                <StatusBadge status={status} />
                                <h1 className="text-4xl font-header font-bold mt-4 mb-2">DEAL DETAILS</h1>
                                <p className="text-gray-400 font-mono text-xs">
                                    {isClient && "You are the Client"}
                                    {isFreelancer && "You are the Freelancer"}
                                    {isArbiter && "You are the Arbiter"}
                                </p>
                            </div>

                            {/* Deal Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6 mb-8"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-gray-400 font-mono text-xs uppercase">Agreement Title</span>
                                        <span className="font-header text-lg">{deal.title}</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-gray-400 font-mono text-xs uppercase">Description</span>
                                        <span className="text-right text-sm max-w-xs">{deal.description}</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-gray-400 font-mono text-xs uppercase">Total Amount</span>
                                        <span className="font-header text-2xl">{deal.amount} ETH</span>
                                    </div>

                                    {contractClient && (
                                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                            <span className="text-gray-400 font-mono text-xs uppercase">Client</span>
                                            <span className="font-mono text-xs text-gray-300">{contractClient as string}</span>
                                        </div>
                                    )}

                                    {contractFreelancer && (
                                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                            <span className="text-gray-400 font-mono text-xs uppercase">Freelancer</span>
                                            <span className="font-mono text-xs text-gray-300">{contractFreelancer as string}</span>
                                        </div>
                                    )}

                                    {contractArbiter && (
                                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                            <span className="text-gray-400 font-mono text-xs uppercase">Arbiter</span>
                                            <span className="font-mono text-xs text-gray-300">{contractArbiter as string}</span>
                                        </div>
                                    )}

                                    {/* Milestones Section */}
                                    {deal.milestones && deal.milestones.length > 0 && (
                                        <div className="pt-6 space-y-4">
                                            <h3 className="text-sm font-mono text-gray-400 uppercase">Payment Milestones</h3>

                                            {/* Progress Bar */}
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                                {deal.milestones.map((milestone, index) => (
                                                    <div
                                                        key={index}
                                                        className="h-full bg-white/80 shadow-[0_0_8px_-2px_rgba(255,255,255,0.4)] transition-all"
                                                        style={{ width: `${milestone.percentage}%` }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Milestone List */}
                                            <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                                                {deal.milestones.map((milestone, index) => (
                                                    <div key={index} className="flex justify-between items-center">
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

                            {/* Action Buttons - Role-based */}
                            <div className="space-y-4">
                                {/* Client Actions - Funded Status */}
                                {isClient && status === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-3"
                                    >
                                        <button
                                            onClick={handleRelease}
                                            className="w-full bg-white text-black font-header font-bold py-4 rounded-full hover:bg-gray-200 transition-all uppercase tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] relative overflow-hidden group"
                                        >
                                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                            <span className="relative">Release Funds to Freelancer</span>
                                        </button>

                                        <button
                                            onClick={handleInitiateDispute}
                                            className="w-full bg-red-500/10 text-red-400 border border-red-500/30 font-header font-bold py-4 rounded-full hover:bg-red-500/20 transition-all uppercase tracking-wider"
                                        >
                                            Initiate Dispute
                                        </button>
                                    </motion.div>
                                )}

                                {/* Freelancer View - Funded Status */}
                                {isFreelancer && status === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 bg-green-500/5 border border-green-500/20 rounded-2xl"
                                    >
                                        <p className="text-green-400 font-mono text-sm">
                                            ⏳ Awaiting client to release funds...
                                        </p>
                                    </motion.div>
                                )}

                                {/* Arbiter Actions - Disputed Status */}
                                {isArbiter && status === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="text-center mb-4">
                                            <p className="text-yellow-400 font-mono text-sm mb-2">⚖️ Dispute Resolution Required</p>
                                            <p className="text-gray-400 text-xs">As the arbiter, you must decide the outcome</p>
                                        </div>

                                        <button
                                            onClick={() => handleResolve(true)}
                                            className="w-full bg-green-500/10 text-green-400 border border-green-500/30 font-header font-bold py-4 rounded-full hover:bg-green-500/20 transition-all uppercase tracking-wider"
                                        >
                                            Release to Freelancer
                                        </button>

                                        <button
                                            onClick={() => handleResolve(false)}
                                            className="w-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-header font-bold py-4 rounded-full hover:bg-blue-500/20 transition-all uppercase tracking-wider"
                                        >
                                            Refund to Client
                                        </button>
                                    </motion.div>
                                )}

                                {/* Pending Status - Redirect to fund */}
                                {status === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl"
                                    >
                                        <p className="text-yellow-400 font-mono text-sm mb-4">
                                            🟡 Deal is pending funding
                                        </p>
                                        <button
                                            onClick={() => router.push(`/deal/new?id=${params.id}`)}
                                            className="px-6 py-3 bg-white text-black font-header font-bold rounded-full hover:bg-gray-200 transition-all"
                                        >
                                            Fund Deal
                                        </button>
                                    </motion.div>
                                )}

                                {/* Released Status */}
                                {status === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl"
                                    >
                                        <p className="text-blue-400 font-mono text-lg mb-2">✅ Deal Completed</p>
                                        <p className="text-gray-400 text-xs">Funds have been released to the freelancer</p>
                                    </motion.div>
                                )}

                                {/* Resolved Status */}
                                {status === 4 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl"
                                    >
                                        <p className="text-purple-400 font-mono text-lg mb-2">🎉 Dispute Resolved</p>
                                        <p className="text-gray-400 text-xs">The arbiter has made their decision</p>
                                    </motion.div>
                                )}

                                {/* Disputed Status - For non-arbiter viewers */}
                                {status === 3 && !isArbiter && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 bg-red-500/5 border border-red-500/20 rounded-2xl"
                                    >
                                        <p className="text-red-400 font-mono text-sm">
                                            ⚖️ Dispute in progress. Awaiting arbiter decision...
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Back Button */}
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => router.push('/')}
                                    className="text-gray-400 hover:text-white font-mono text-sm transition-colors"
                                >
                                    ← Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
