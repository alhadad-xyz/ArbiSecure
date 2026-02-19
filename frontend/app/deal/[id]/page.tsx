"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { formatEther, parseEther, decodeEventLog, parseAbiItem } from "viem";
import { toast } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import LandingHeader from "@/components/landing/LandingHeader";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import type { Deal, DealStatus as DbDealStatus } from "@/lib/supabase";
import WhiteCurtainLoader from "@/components/animations/WhiteCurtainLoader";
import { Button, StatusBadge, StatusMessage, InfoCard, InfoField, InfoGrid } from "@/components/ui";
import DisputeView from "@/components/deal/DisputeView";
import DisputeForm from "@/components/deal/DisputeForm";
import { Clock, Hand, Link, Lock, CheckCircle, AlertTriangle, CheckCircle2, Scale, PartyPopper, Timer, Circle } from "lucide-react";

// Status enum matching contract
const DealStatus = {
    0: "Pending",
    1: "Funded",
    2: "Active",
    3: "Disputed",
    4: "Completed"
} as const;


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
                if (data.contract_deal_id !== undefined && data.contract_deal_id !== null) {
                    setDealId(BigInt(data.contract_deal_id));
                } else if (data.deal_id) {
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
    // Read contract state (only if we have a deal ID)
    const { data: contractStatus } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "getDealStatus",
        args: dealId !== null ? [dealId] : undefined,
        query: { enabled: dealId !== null }
    });

    const { data: contractClient } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "getDealClient",
        args: dealId !== null ? [dealId] : undefined,
        query: { enabled: dealId !== null }
    });

    const { data: contractFreelancer } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "getDealFreelancer",
        args: dealId !== null ? [dealId] : undefined,
        query: { enabled: dealId !== null }
    });

    const { data: contractArbiter } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ARBISECURE_ABI,
        functionName: "getDealArbiter",
        args: dealId !== null ? [dealId] : undefined,
        query: { enabled: dealId !== null }
    });

    const status = contractStatus !== undefined ? Number(contractStatus) as keyof typeof DealStatus : 0;

    // Fetch Milestone Statuses
    const { data: milestoneStatuses } = useReadContracts({
        contracts: deal?.milestones.map((_, index) => ({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: 'getMilestone',
            args: dealId !== null ? [dealId, BigInt(index)] : undefined,
        })) || [],
        query: {
            enabled: dealId !== null && !!deal?.milestones
        }
    });



    // State for transitions - MUST be declared before any conditional returns
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Create Deal Logic
    // dispute logic follows

    // Dispute Logic
    const [showDisputeForm, setShowDisputeForm] = useState(false);

    const [pendingDisputeData, setPendingDisputeData] = useState<{ reason: string, evidence_links: string[], initiator_address: string } | null>(null);

    // Contract write functions
    const { writeContract: createDeal, data: createHash, isPending: isCreatePending, isError: isCreateError, error: createError } = useWriteContract();
    const { writeContract: release, data: releaseHash } = useWriteContract();

    // Wait for transactions
    const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess, data: createReceipt } = useWaitForTransactionReceipt({ hash: createHash });

    const { writeContract: initiateDispute, data: disputeHash, isPending: isDisputePending } = useWriteContract();
    const { writeContract: resolveDispute, data: resolveHash } = useWriteContract();

    // Wait for transactions
    const { isSuccess: isReleaseSuccess } = useWaitForTransactionReceipt({ hash: releaseHash });
    const { isSuccess: isDisputeSuccess, isLoading: isDisputeConfirming } = useWaitForTransactionReceipt({ hash: disputeHash });
    const { isSuccess: isResolveSuccess } = useWaitForTransactionReceipt({ hash: resolveHash });

    // Dispute Ruling Logic
    const publicClient = usePublicClient();
    const [ruling, setRuling] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!dealId || !publicClient || status !== 4) return;

        const fetchRuling = async () => {
            try {
                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: parseAbiItem('event DisputeResolved(uint256 indexed deal_id, uint256 client_amount, uint256 freelancer_amount, uint256 arbiter_fee)'),
                    args: { deal_id: dealId },
                    fromBlock: 0n // Search from genesis/deployment
                });

                if (logs.length > 0) {
                    const log = logs[0];
                    const { client_amount, freelancer_amount } = log.args;
                    // Logic: 1=Client, 2=Freelancer, 3=Split
                    if (client_amount! > freelancer_amount!) setRuling(1);
                    else if (freelancer_amount! > client_amount!) setRuling(2);
                    else setRuling(3);
                }
            } catch (e) {
                console.error("Error fetching dispute logs:", e);
            }
        };
        fetchRuling();
    }, [dealId, publicClient, status]);

    // Handle transaction success
    useEffect(() => {
        // Create Deal Success
        if (isCreateSuccess) {
            toast.success("Deal created and funded successfully!");

            const handleDealCreation = async () => {
                if (!params.id) return;

                let contractDealId: string | undefined;

                // Try to extract dealId from logs if receipt is available
                if (createReceipt && createReceipt.logs) {
                    try {
                        for (const log of createReceipt.logs) {
                            try {
                                const decoded = decodeEventLog({
                                    abi: ARBISECURE_ABI,
                                    data: log.data,
                                    topics: log.topics
                                });

                                if (decoded.eventName === 'DealCreated') {
                                    contractDealId = decoded.args.deal_id.toString();
                                    console.log("✅ [Create] Found DealCreated event. Deal ID:", contractDealId);

                                    // Also set local state immediately
                                    setDealId(BigInt(contractDealId));
                                    break;
                                }
                            } catch (e) {
                                // Not the event we are looking for or decoding failed
                                continue;
                            }
                        }
                    } catch (err) {
                        console.error("❌ [Create] Failed to parse transaction logs:", err);
                    }
                }

                try {
                    const body: any = { status: 'funded' };
                    if (contractDealId) {
                        body.contract_deal_id = Number(contractDealId);
                    }

                    const response = await fetch(`/api/deals/${params.id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });

                    if (!response.ok) throw new Error('Failed to update status');

                    setIsTransitioning(true);

                    setTimeout(() => window.location.reload(), 1000);
                } catch (err) {
                    console.error('Error updating status:', err);
                    toast.error("Failed to update status");
                }
            };

            handleDealCreation();
        };
    }, [isCreateSuccess, createReceipt, params.id]);

    useEffect(() => {
        if (isCreateError) {
            console.error("Transaction error:", createError);
            toast.error(`Transaction failed: ${createError?.message || "Unknown error"}`);
        }
    }, [isCreateError, createError]);

    const handleCreateAndFund = async () => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            if (!deal) return;
            const parsedAmount = parseEther(deal.amount);

            // Prepare arguments for create_deal
            // Signature: create_deal(uint256 _ref_id, address freelancer, address arbiter, address token, uint256 amount, string[] milestone_titles, uint256[] milestone_amounts, uint256[] milestone_end_times, bool[] milestone_approvals)

            // Calculate milestone amounts based on percentage to ensure precision and matching total
            // format: { title: string, percentage: number, amount: number (calculated) }
            // The contract expects exact wei values.
            // If we have percentages, we should calculate amounts from total * percentage / 100

            // However, the `deal` object from DB might have `amount` as string.
            // Let's rely on the percentages if available, as they are likely the source of truth for the split.
            // If not, we use the `amount` field. 
            // BUT, `deal.milestones` element has `amount` which seems to be a number or string in the DB.

            // CRITICAL: floating point math in JS can cause 1 wei mismatches.
            // We must ensure the sum equals `parsedAmount`.

            let accumulatedAmount = BigInt(0);
            const milestoneAmounts: bigint[] = [];

            const milestones = deal.milestones || [];

            milestones.forEach((m, index) => {
                if (index === milestones.length - 1) {
                    // Last milestone gets the remainder to ensure exact match
                    milestoneAmounts.push(parsedAmount - accumulatedAmount);
                } else {
                    // Calculate based on percentage if possible, otherwise parse existing amount
                    let amountStr = m.amount ? m.amount.toString() : "0";
                    const amountVal = parseFloat(amountStr);

                    // If amount is 0 (or "0.00") but we have percentage, recalculate
                    if ((amountVal === 0 || !m.amount) && m.percentage) {
                        const calculated = (parsedAmount * BigInt(m.percentage)) / BigInt(100);
                        milestoneAmounts.push(calculated);
                        accumulatedAmount += calculated;
                    } else {
                        // Trust the amount but parse it safe
                        const val = parseEther(amountStr);
                        milestoneAmounts.push(val);
                        accumulatedAmount += val;
                    }
                }
            });

            // Re-map titles
            const milestoneTitles = milestones.map(m => m.title);

            // Compute end times from time-based conditions
            // For time conditions: endTime = now (seconds) + daysAfterPrevious * 86400
            const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
            const milestoneEndTimes = milestones.map((m) => {
                const timeCond = m.conditions?.find(c => c.type === 'time');
                if (timeCond && timeCond.daysAfterPrevious && timeCond.daysAfterPrevious > 0) {
                    return nowSeconds + BigInt(timeCond.daysAfterPrevious) * BigInt(86400);
                }
                return BigInt(0);
            });

            // Approvals: false for time-based auto-release, true for manual/no-condition
            const milestoneApprovals = milestones.map((m) => {
                const conditions = m.conditions || [];
                if (conditions.length === 0) return true; // no condition = manual approval
                const hasTimeCondition = conditions.some(c => c.type === 'time');
                const hasManualCondition = conditions.some(c => c.type === 'manual');
                if (hasTimeCondition && !hasManualCondition) return false; // pure time = auto-release
                return true; // manual or hybrid = requires approval
            });

            const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

            // Get current gas parameters with buffer to prevent "max fee per gas less than block base fee" errors
            const { getPublicClient } = await import('wagmi/actions');
            const { config: wagmiConfig } = await import('@/lib/wagmi');
            const publicClient = getPublicClient(wagmiConfig);

            if (!publicClient) {
                toast.error("Unable to connect to network");
                return;
            }

            // Fetch current block to get base fee
            const block = await publicClient.getBlock();
            const baseFee = block.baseFeePerGas || 0n;

            // Add 30% buffer to base fee to account for fluctuations
            const maxFeePerGas = (baseFee * 13n) / 10n;
            // Priority fee should be small fraction of max fee (10% of base fee)
            const maxPriorityFeePerGas = baseFee / 10n;

            console.log("🔍 Gas Estimation:", {
                baseFee: baseFee.toString(),
                maxFeePerGas: maxFeePerGas.toString(),
                maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
            });

            // Call with explicit gas parameters to add buffer
            // This prevents "max fee per gas less than block base fee" errors
            createDeal({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "create_deal",
                args: [
                    BigInt(0), // _ref_id
                    deal.freelancer as `0x${string}`,
                    deal.arbiter as `0x${string}`,
                    ZERO_ADDRESS, // token (Address::ZERO for ETH)
                    parsedAmount,
                    milestoneAmounts,
                    milestoneEndTimes,
                    milestoneApprovals
                ],
                value: parsedAmount,
                maxFeePerGas,
                maxPriorityFeePerGas,
            });
            // We do not set dealId here because it's only available AFTER the transaction
        } catch (error) {
            console.error("Error preparing transaction:", error);
            toast.error("Failed to prepare transaction.");
        }
    };

    useEffect(() => {
        if (isReleaseSuccess) {
            toast.success("Funds released successfully!");
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isReleaseSuccess]);

    useEffect(() => {
        if (isDisputeSuccess) {
            const handleDisputeSuccess = async () => {
                toast.success("Dispute initiated. Arbiter has been notified.");

                // Update DB Status AND create dispute record if we have pending data
                if (params.id) {
                    try {
                        // 1. Create Dispute Record
                        if (pendingDisputeData) {
                            await fetch(`/api/deals/${params.id}/dispute`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(pendingDisputeData)
                            });
                        }

                        // 2. Update Deal Status (redundant if API does it, but safe)
                        await fetch(`/api/deals/${params.id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'disputed' })
                        });
                    } catch (err) {
                        console.error("Failed to update status in DB", err);
                    }
                }

                setTimeout(() => window.location.reload(), 1000);
            };
            handleDisputeSuccess();
        }
    }, [isDisputeSuccess, params.id, pendingDisputeData]);

    useEffect(() => {
        if (isResolveSuccess) {
            toast.success("Dispute resolved!");
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isResolveSuccess]);

    // Helper to update status in DB (Mock Mode or fallback)
    const updateStatus = async (newStatus: 'funded' | 'completed' | 'disputed') => {
        if (!params.id) return;
        try {
            const response = await fetch(`/api/deals/${params.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            toast.success("Status updated successfully!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error("Failed to update status");
        }
    };

    // Helper to get gas parameters with buffer
    const getGasParameters = async () => {
        try {
            const { getPublicClient } = await import('wagmi/actions');
            const { config: wagmiConfig } = await import('@/lib/wagmi');
            const publicClient = getPublicClient(wagmiConfig);

            if (!publicClient) {
                console.error("Unable to get public client");
                return undefined;
            }

            const block = await publicClient.getBlock();
            const baseFee = block.baseFeePerGas || 0n;

            // Add 30% buffer to base fee
            const maxFeePerGas = (baseFee * 13n) / 10n;
            // Priority fee should be small fraction of max fee (10% of base fee)
            const maxPriorityFeePerGas = baseFee / 10n;

            console.log("🔍 Gas Estimation:", {
                baseFee: baseFee.toString(),
                maxFeePerGas: maxFeePerGas.toString()
            });

            return { maxFeePerGas, maxPriorityFeePerGas };
        } catch (e) {
            console.error("Failed to estimate gas:", e);
            return undefined;
        }
    };

    // Action handlers
    const handleRelease = async (milestoneIndex: number) => {
        console.log("🚀 [Release] handleRelease called for index:", milestoneIndex);
        console.log("🔍 [Release] Deal ID:", dealId);
        console.log("📝 [Release] Contract:", CONTRACT_ADDRESS);

        if (dealId === null) {
            console.error("❌ [Release] Deal ID is null!");
            return;
        }

        try {
            const gasParams = await getGasParameters();

            release({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "releaseMilestone",
                args: [dealId, BigInt(milestoneIndex)],
                ...(gasParams || {})
            });
        } catch (e) {
            console.error("❌ [Release] Error calling release:", e);
            toast.error("Failed to initiate release transaction");
        }
    };

    const handleInitiateDispute = async (data: { reason: string; evidence: string[] }) => {
        console.log("🔍 [Dispute] handleInitiateDispute called with:", data);
        console.log("🔍 [Dispute] Current Deal ID:", dealId, typeof dealId);

        if (dealId === null) {
            console.error("❌ [Dispute] Deal ID is null! Cannot initiate dispute.");
            return;
        }

        try {
            console.log("🚀 [Dispute] Triggering contract transaction 'raise_dispute'...");

            // 1. Trigger Contract Call
            const gasParams = await getGasParameters();

            initiateDispute({
                address: CONTRACT_ADDRESS,
                abi: ARBISECURE_ABI,
                functionName: "raiseDispute",
                args: [dealId],
                ...(gasParams || {})
            });

            console.log("✅ [Dispute] Transaction sent to wallet. Waiting for signature...");

            setPendingDisputeData({
                reason: data.reason,
                evidence_links: data.evidence,
                initiator_address: address || ''
            });

        } catch (error) {
            console.error("❌ [Dispute] Error initiating dispute:", error);
            toast.error("Failed to initiate dispute");
        }
    };

    const handleResolve = async (releaseToFreelancer: boolean) => {
        if (dealId === null || !deal) return;

        const parsedAmount = parseEther(deal.amount);

        // Calculate shares based on decision
        // releasesToFreelancer = true -> client: 0, freelancer: total
        // releasesToFreelancer = false -> client: total, freelancer: 0
        const clientShare = releaseToFreelancer ? BigInt(0) : parsedAmount;
        const freelancerShare = releaseToFreelancer ? parsedAmount : BigInt(0);

        const gasParams = await getGasParameters();

        resolveDispute({
            address: CONTRACT_ADDRESS,
            abi: ARBISECURE_ABI,
            functionName: "resolveDispute",
            args: [dealId, clientShare, freelancerShare],
            ...(gasParams || {})
        });
    };

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
                            <Button
                                onClick={() => router.push('/')}
                                variant="primary"
                                size="md"
                                className="mt-4"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Check database status first - if deal is 'pending', show funding UI
    // If deal is 'funded' or 'completed', show deal management UI

    // Effective Status Logic:
    // 1. If we have a contract status, use it (Real Mode)
    // 2. Fallback to Supabase status (which is updated by DealReviewUI)
    let effectiveStatus: DbDealStatus = deal.status;

    if (contractStatus !== undefined) {
        effectiveStatus = DealStatus[Number(contractStatus) as keyof typeof DealStatus].toLowerCase() as DbDealStatus;
    }

    // Deal is funded or completed - show the deal management UI
    // Determine user role for role-based UI

    let isClient: boolean;
    let isFreelancer: boolean;
    let isArbiter: boolean;

    // Production mode: require wallet connection
    const currentAddress = address ? address.toLowerCase() : '';

    // Use contract data if available, otherwise fall back to Supabase data
    const clientAddress = (contractClient as string) || deal.client;
    const freelancerAddress = (contractFreelancer as string) || deal.freelancer;
    const arbiterAddress = (contractArbiter as string) || deal.arbiter;

    isClient = currentAddress === (clientAddress || '').toLowerCase();
    isFreelancer = currentAddress === (freelancerAddress || '').toLowerCase();
    isArbiter = currentAddress === (arbiterAddress || '').toLowerCase();

    // Prepare deal data for display
    const dealData = {
        title: deal.title,
        description: deal.description,
        amount: deal.amount,
        freelancer: deal.freelancer,
        client: deal.client || (contractClient as string),
        arbiter: deal.arbiter,
        milestones: deal.milestones,
        status: effectiveStatus,
        created_at: deal.created_at,
        deal_id: deal.contract_deal_id,
        id: deal.id,
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
                                    className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-xs font-mono uppercase tracking-wider border border-white/20 rounded-full bg-white/5"
                                >
                                    {dealData.status === 'pending' && <span className="text-yellow-400"><Circle className="w-2.5 h-2.5 fill-yellow-400" /></span>}
                                    {dealData.status === 'funded' && <span className="text-green-400"><Circle className="w-2.5 h-2.5 fill-green-400" /></span>}
                                    {(dealData.status as string) === 'disputed' && <span className="text-red-400"><AlertTriangle className="w-3.5 h-3.5" /></span>}
                                    {(dealData.status as string) === 'active' && <span className="text-blue-400"><Timer className="w-3.5 h-3.5" /></span>}
                                    {/* Debug Log */}

                                    {(dealData.status === 'completed' || dealData.status === 'released') && <span className="text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /></span>}
                                    <span>{dealData.status ? dealData.status.toUpperCase() : 'INCOMING AGREEMENT'}</span>
                                </motion.div>
                                <h1 className="text-4xl font-header font-bold mb-2">
                                    {effectiveStatus === 'pending' ? 'REVIEW & FUND' : 'DEAL DETAILS'}
                                </h1>
                                <p className="text-gray-400 font-mono text-xs">
                                    {effectiveStatus === 'pending' ? (
                                        "You have been invited to fund a secure escrow deal."
                                    ) : (
                                        <>
                                            {isClient && "You are the Client"}
                                            {isFreelancer && "You are the Freelancer"}
                                            {isArbiter && "You are the Arbiter"}
                                            {!isClient && !isFreelancer && !isArbiter && "View-only mode"}
                                        </>
                                    )}
                                </p>
                                {dealData.created_at && (
                                    <p className="text-gray-500 font-mono text-[10px] mt-2">
                                        Created: {new Date(dealData.created_at).toLocaleString()}
                                    </p>
                                )}

                                {/* Dispute Link Button */}
                                {((dealData.status as string).toLowerCase() === 'disputed' ||
                                    (((dealData.status as string).toLowerCase() === 'resolved' || (dealData.status as string).toLowerCase() === 'completed') && ruling !== undefined)) && (
                                        <div className="mt-4">
                                            <Button
                                                onClick={() => router.push(`/dispute/${params.id}`)}
                                                variant="danger"
                                                size="sm"
                                                icon={<AlertTriangle className="w-4 h-4" />}
                                                className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                            >
                                                View Dispute Details
                                            </Button>
                                        </div>
                                    )}
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
                                            <div className="flex justify-between items-end">
                                                <label className="text-xs font-mono text-gray-500 uppercase">Payment Milestones</label>
                                                <div className="text-xs font-mono text-gray-400">
                                                    {milestoneStatuses?.filter(m => m.result?.[1]).length || 0}/{dealData.milestones.length} Released
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                                                {dealData.milestones.map((milestone, index) => {
                                                    const isReleased = milestoneStatuses?.[index]?.result?.[1] || false;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`h-full transition-all ${isReleased ? 'bg-green-500' : 'bg-white/30'}`}
                                                            style={{ width: `${milestone.percentage}%` }}
                                                        />
                                                    );
                                                })}
                                            </div>

                                            {/* Milestone List with Actions */}
                                            <div className="space-y-3">
                                                {dealData.milestones.map((milestone, index) => {
                                                    const mStatus = milestoneStatuses?.[index]?.result;
                                                    // [amount, is_released, end_timestamp, requires_approval]
                                                    const isReleased = mStatus?.[1] || false;
                                                    const requiresApproval = mStatus?.[3] ?? true; // Default to true if loading
                                                    const endTime = mStatus?.[2] ? Number(mStatus[2]) : 0;
                                                    const isTimeLocked = endTime > 0 && Date.now() / 1000 < endTime;

                                                    // Determine buttons to show
                                                    // DB conditions take priority over the contract's requiresApproval flag
                                                    // (the contract may have stored requiresApproval=true due to a previous bug)
                                                    const dbConditions = milestone.conditions || [];
                                                    const isTimeBasedFromDB = dbConditions.some((c: any) => c.type === 'time') &&
                                                        !dbConditions.some((c: any) => c.type === 'manual');
                                                    const isManualFromDB = dbConditions.some((c: any) => c.type === 'manual');
                                                    const timePassedOrNoLock = !isTimeLocked;

                                                    // Effective approval requirement: DB wins over contract flag
                                                    const effectiveRequiresApproval = isTimeBasedFromDB ? false : (isManualFromDB ? true : requiresApproval);

                                                    // Check if previous milestone is released
                                                    const isPreviousReleased = index === 0 || (milestoneStatuses?.[index - 1]?.result?.[1] || false);

                                                    const showReleaseBtn = !isReleased && isPreviousReleased && (
                                                        isClient || // Client can always release (early approval)
                                                        (!effectiveRequiresApproval && isFreelancer && timePassedOrNoLock) // Freelancer can release only if auto-release AND time passed
                                                    );

                                                    // Time condition details for display
                                                    const timeCond = dbConditions.find((c: any) => c.type === 'time');
                                                    const daysAfterPrevious = timeCond?.daysAfterPrevious ?? null;

                                                    return (
                                                        <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-gray-400 font-mono text-xs">#{index + 1}</span>
                                                                        <span className="text-white font-medium text-sm">{milestone.title}</span>
                                                                    </div>
                                                                    <div className="text-xs font-mono text-gray-500 mt-1">
                                                                        {milestone.amount} ETH ({milestone.percentage}%)
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    {isReleased ? (
                                                                        <span className="inline-flex items-center gap-1 text-green-400 font-mono text-xs bg-green-400/10 px-2 py-1 rounded">
                                                                            <span>✓</span> Released
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 text-yellow-500 font-mono text-xs bg-yellow-500/10 px-2 py-1 rounded">
                                                                            <span>●</span> Pending
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Conditions & Actions */}
                                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                                                <div className="text-xs font-mono text-gray-500">
                                                                    {/* Show condition type from DB if available, fall back to contract flag */}
                                                                    {(() => {
                                                                        const conditions = milestone.conditions || [];
                                                                        if (conditions.length > 0) {
                                                                            const hasTime = conditions.some((c: any) => c.type === 'time');
                                                                            const hasManual = conditions.some((c: any) => c.type === 'manual');
                                                                            const hasOracle = conditions.some((c: any) => c.type === 'oracle');
                                                                            if (hasTime && !hasManual) return <span className="text-orange-300 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time-Based Auto-Release</span>;
                                                                            if (hasManual) return <span className="flex items-center gap-1"><Hand className="w-3.5 h-3.5" /> Requires Client Approval</span>;
                                                                            if (hasOracle) return <span className="text-blue-300 flex items-center gap-1"><Link className="w-3.5 h-3.5" /> Oracle Condition</span>;
                                                                        }
                                                                        return <span className="flex items-center gap-1">{effectiveRequiresApproval ? <><Hand className="w-3.5 h-3.5" /> Requires Client Approval</> : <><Clock className="w-3.5 h-3.5" /> Auto-Release Condition</>}</span>;
                                                                    })()}
                                                                    {/* Show duration for time-based conditions */}
                                                                    {isTimeBasedFromDB && daysAfterPrevious !== null && (
                                                                        <span className="block text-gray-600 mt-0.5">
                                                                            Auto-releases after {daysAfterPrevious} {daysAfterPrevious === 1 ? 'day' : 'days'}
                                                                        </span>
                                                                    )}
                                                                    {/* Show on-chain time lock status if set */}
                                                                    {endTime > 0 && (
                                                                        <span className="block text-orange-400 mt-0.5 flex items-center gap-1">
                                                                            {isTimeLocked ? <><Lock className="w-3 h-3" /> Locked until {new Date(endTime * 1000).toLocaleString()}</> : <><CheckCircle className="w-3 h-3 text-green-400" /> Time lock passed</>}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {showReleaseBtn && (status === 1 || dealData.status === 'funded' || dealData.status === 'active') && (
                                                                    <Button
                                                                        onClick={() => handleRelease(index)}
                                                                        variant={effectiveRequiresApproval || isTimeLocked ? "primary" : "secondary"}
                                                                        size="sm"
                                                                        disabled={false}
                                                                    >
                                                                        {isTimeLocked ? "Approve Early" : (effectiveRequiresApproval ? "Approve & Release" : "Execute Release")}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Action Buttons - Role-based */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4"
                            >
                                {/* Pending Status - Create & Fund */}
                                {effectiveStatus === 'pending' && (
                                    <div className="space-y-4">
                                        {!address ? (
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
                                                disabled={isCreatePending || isCreateConfirming}
                                                className="w-full bg-white text-black font-header font-bold py-4 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] relative overflow-hidden group"
                                            >
                                                {isCreatePending || isCreateConfirming ? "CONFIRMING..." : "CREATE & FUND DEAL"}
                                                <div className="absolute inset-0 bg-white/40 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Dispute Form View */}
                                {showDisputeForm ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key="dispute-form"
                                        className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl space-y-4"
                                    >
                                        <div className="flex items-center gap-3 text-red-500 mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                            </svg>
                                            <h3 className="font-header font-bold text-lg uppercase tracking-wider">Initiate Dispute</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm font-mono leading-relaxed mb-4">
                                            Please provide a reason and evidence for the dispute. This information will be reviewed by the Arbiter.
                                        </p>

                                        <DisputeForm
                                            onSubmit={handleInitiateDispute}
                                            isSubmitting={isDisputePending || isDisputeConfirming}
                                            onCancel={() => setShowDisputeForm(false)}
                                        />
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Client Actions - Funded Status */}
                                        {isClient && (status === 1 || dealData.status === 'funded') && (
                                            <div className="space-y-3">
                                                <Button
                                                    onClick={() => setShowDisputeForm(true)}
                                                    variant="danger"
                                                    size="lg"
                                                    fullWidth
                                                    uppercase
                                                >
                                                    Initiate Dispute
                                                </Button>
                                            </div>
                                        )}

                                        {/* Freelancer View - Funded Status */}
                                        {isFreelancer && (status === 1 || dealData.status === 'funded') && (
                                            <div className="space-y-3">
                                                <StatusMessage
                                                    variant="success"
                                                    message="Reviews milestones above to release funds..."
                                                />
                                                <Button
                                                    onClick={() => setShowDisputeForm(true)}
                                                    variant="danger"
                                                    size="lg"
                                                    fullWidth
                                                    uppercase
                                                >
                                                    Initiate Dispute
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Arbiter Actions - Disputed Status */}
                                {isArbiter && (status === 3 || (dealData.status as string) === 'disputed') && (
                                    <div className="space-y-4">
                                        <div className="text-center mb-4">
                                            <p className="text-yellow-400 font-mono text-sm mb-2 flex items-center gap-2"><Scale className="w-4 h-4" /> Dispute Resolution Required</p>
                                            <p className="text-gray-400 font-mono text-xs">As the arbiter, you must decide the outcome</p>
                                        </div>

                                        <Button
                                            onClick={() => handleResolve(true)}
                                            variant="success"
                                            size="lg"
                                            fullWidth
                                            uppercase
                                        >
                                            Release to Freelancer
                                        </Button>

                                        <Button
                                            onClick={() => handleResolve(false)}
                                            variant="secondary"
                                            size="lg"
                                            fullWidth
                                            uppercase
                                        >
                                            Refund to Client
                                        </Button>
                                    </div>
                                )}


                                {/* Resolved Status (Dispute) */}
                                {(dealData.status === 'resolved' || (dealData.status === 'disputed' && status === 4)) && (
                                    <StatusMessage
                                        variant="neutral"
                                        title="Dispute Resolved"
                                        message="The arbiter has made their decision"
                                    />
                                )}

                                {/* Completed Status (Happy Path) */}
                                {status === 4 && dealData.status !== 'resolved' && dealData.status !== 'disputed' && (
                                    <StatusMessage
                                        variant="success"
                                        title="Deal Completed"
                                        message="All milestones have been released successfully."
                                    />
                                )}

                                {/* Disputed Status - For non-arbiter viewers */}
                                {(status === 3 || (dealData.status as string) === 'disputed') && !isArbiter && (
                                    <div className="space-y-3">
                                        <StatusMessage
                                            variant="error"
                                            message="Dispute in progress. Awaiting arbiter decision..."
                                        />
                                        <Button
                                            onClick={() => window.location.reload()}
                                            variant="danger"
                                            size="lg"
                                            fullWidth
                                            uppercase
                                        >
                                            View Dispute Details
                                        </Button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 text-center space-y-4"
                            >
                                <Button
                                    onClick={() => router.push('/')}
                                    variant="ghost"
                                    size="sm"
                                    uppercase
                                >
                                    ← Back to Home
                                </Button>
                                <p className="text-[10px] text-gray-500 font-mono">
                                    Powered by ArbiSecure Stylus • Trustless & Secure
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
