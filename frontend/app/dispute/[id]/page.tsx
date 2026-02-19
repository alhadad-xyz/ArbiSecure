"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther, parseAbiItem } from "viem";
import { toast } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import LandingHeader from "@/components/landing/LandingHeader";
import { ARBISECURE_ABI, CONTRACT_ADDRESS } from "@/lib/abi";
import type { Deal, DealStatus as DbDealStatus } from "@/lib/supabase";
import { Button } from "@/components/ui";
import DisputeView from "@/components/deal/DisputeView";
import { ArrowLeft } from "lucide-react";

// Status enum matching contract
const DealStatus = {
    0: "Pending",
    1: "Funded",
    2: "Active",
    3: "Disputed",
    4: "Completed"
} as const;


export default function DisputePage() {
    const params = useParams();
    const router = useRouter();
    const { address } = useAccount();

    // State
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
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
                toast.error('Deal not found');
            } finally {
                setLoading(false);
            }
        };

        fetchDeal();
    }, [params.id]);

    // Read contract state
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

    // Effective Status Logic
    let effectiveStatus: DbDealStatus = deal?.status || 'pending';
    if (contractStatus !== undefined) {
        effectiveStatus = DealStatus[Number(contractStatus) as keyof typeof DealStatus].toLowerCase() as DbDealStatus;
    }

    // Role Logic
    const currentAddress = address ? address.toLowerCase() : '';
    const clientAddress = (contractClient as string) || deal?.client;
    const freelancerAddress = (contractFreelancer as string) || deal?.freelancer;
    const arbiterAddress = (contractArbiter as string) || deal?.arbiter;

    const isClient = currentAddress === (clientAddress || '').toLowerCase();
    const isFreelancer = currentAddress === (freelancerAddress || '').toLowerCase();
    const isArbiter = currentAddress === (arbiterAddress || '').toLowerCase();

    // Dispute Actions
    const { writeContract: resolveDispute, data: resolveHash } = useWriteContract();
    const { isSuccess: isResolveSuccess } = useWaitForTransactionReceipt({ hash: resolveHash });

    useEffect(() => {
        if (isResolveSuccess) {
            toast.success("Dispute resolved!");
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isResolveSuccess]);

    // Dispute Ruling Logic
    const publicClient = usePublicClient();
    const [ruling, setRuling] = useState<number | undefined>(undefined);

    useEffect(() => {
        // Fetch ruling if status is Completed (4) OR Resolved in DB (checked by effectiveStatus logic mainly)
        if (!dealId || !publicClient || status !== 4) return;

        const fetchRuling = async () => {
            try {
                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: parseAbiItem('event DisputeResolved(uint256 indexed deal_id, uint256 client_amount, uint256 freelancer_amount, uint256 arbiter_fee)'),
                    args: { deal_id: dealId },
                    fromBlock: 0n
                });

                if (logs.length > 0) {
                    const log = logs[0];
                    const { client_amount, freelancer_amount } = log.args;
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

    // Gas Params
    const getGasParameters = async () => {
        try {
            const { getPublicClient } = await import('wagmi/actions');
            const { config: wagmiConfig } = await import('@/lib/wagmi');
            const publicClient = getPublicClient(wagmiConfig);
            if (!publicClient) return undefined;
            const block = await publicClient.getBlock();
            const baseFee = block.baseFeePerGas || 0n;
            return {
                maxFeePerGas: (baseFee * 13n) / 10n,
                maxPriorityFeePerGas: baseFee / 10n
            };
        } catch (e) {
            console.error("Failed to estimate gas:", e);
            return undefined;
        }
    };

    const handleResolve = async (releaseToFreelancer: boolean) => {
        if (dealId === null || !deal) return;
        const parsedAmount = parseEther(deal.amount);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!deal) {
        return <div className="p-10 text-white text-center">Deal not found</div>;
    }

    // Prepare data for DisputeView
    const dealData = {
        ...deal,
        status: effectiveStatus,
        contract_deal_id: deal.contract_deal_id,
        id: deal.id
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans selection:bg-white/20">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-red-900 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
                <div className="absolute -bottom-40 right-20 w-80 h-80 bg-orange-900 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <LandingHeader />



                <div className="flex-grow flex items-center justify-center p-4">
                    <DisputeView
                        deal={dealData as any}
                        isArbiter={isArbiter}
                        isClient={isClient}
                        isFreelancer={isFreelancer}
                        onResolve={handleResolve}
                        ruling={ruling}
                    />
                </div>
            </div>
        </div>
    );
}
