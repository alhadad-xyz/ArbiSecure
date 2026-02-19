"use client";

import { motion } from "framer-motion";
import { Button, StatusMessage } from "@/components/ui";
import type { Deal } from "@/lib/supabase";
import { AlertTriangle, Paperclip, Check, Undo2 } from "lucide-react";

interface DisputeViewProps {
    deal: Deal;
    isArbiter: boolean;
    isClient: boolean;
    isFreelancer: boolean;
    onResolve: (releaseToFreelancer: boolean) => void;
    ruling?: number; // 0=None, 1=Client, 2=Freelancer
}

import { useEffect, useState } from "react";
import type { Dispute } from "@/lib/supabase";


export default function DisputeView({ deal, isArbiter, isClient, isFreelancer, onResolve, ruling }: DisputeViewProps) {
    const [dispute, setDispute] = useState<Dispute | null>(null);
    const isResolved = ruling !== undefined && ruling > 0;

    useEffect(() => {
        if (!deal?.id) return;

        const fetchDispute = async () => {
            try {
                const res = await fetch(`/api/deals/${deal.id}/dispute`);
                if (res.ok) {
                    const data = await res.json();
                    setDispute(data);
                }
            } catch (err) {
                console.error("Failed to fetch dispute", err);
            }
        };
        fetchDispute();
    }, [deal.id]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-8 md:p-12 relative overflow-hidden"
        >
            {/* Background Effects - Subtle Monochrome */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>


            <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-xs font-mono uppercase tracking-wider border rounded-full border-white/20 bg-white/5 text-gray-300">
                    <span className="animate-pulse">{isResolved ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}</span>
                    <span>{isResolved ? "Dispute Resolved" : "Dispute In Progress"}</span>
                </div>

                <h1 className="text-4xl font-header font-bold mb-4 text-white">
                    {isResolved ? "Case Closed" : "Dispute Under Review"}
                </h1>

                {!isResolved && (
                    <p className="text-gray-400 font-mono text-xs max-w-md mx-auto leading-relaxed">
                        This agreement has been escalated to dispute. All funds are currently frozen and held in escrow pending the Arbiter&apos;s review and ruling.
                    </p>
                )}

                {isResolved && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-center">
                        <p className="text-white font-header text-xl mb-2">
                            Ruling: {ruling === 2 ? "Released to Freelancer" : (ruling === 1 ? "Refunded to Client" : "Split Decision")}
                        </p>
                        <p className="text-gray-400 text-xs font-mono">
                            The Arbiter has issued a final decision. Funds have been transferred accordingly.
                        </p>
                    </div>
                )}
            </div>

            {/* Deal Info Compact */}
            {!isResolved && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                        <span className="text-xs font-mono text-gray-500 uppercase">Disputed Amount</span>
                        <span className="text-2xl font-header font-bold text-white">{deal.amount} <span className="text-sm text-gray-400">ETH</span></span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-mono uppercase">Arbiter</span>
                            <span className="text-white font-mono">{deal.arbiter}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-mono uppercase">Client</span>
                            <span className="text-gray-400 font-mono">{deal.client}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-mono uppercase">Freelancer</span>
                            <span className="text-gray-400 font-mono">{deal.freelancer}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispute Details */}
            {dispute && (
                <div className="border rounded-xl p-6 mb-8 bg-white/5 border-white/10">
                    <h3 className="font-header font-bold mb-3 uppercase tracking-wider text-sm text-gray-300">Dispute Details</h3>

                    <div className="mb-4">
                        <label className="text-xs font-mono text-gray-500 uppercase block mb-1">Reason</label>
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{dispute.reason}</p>
                    </div>

                    {dispute.evidence_links && dispute.evidence_links.length > 0 && (
                        <div>
                            <label className="text-xs font-mono text-gray-500 uppercase block mb-2">Evidence</label>
                            <ul className="space-y-2">
                                {dispute.evidence_links.map((link, i) => (
                                    <li key={i}>
                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs font-mono hover:underline flex items-center gap-2 truncate">
                                            <Paperclip className="w-3.5 h-3.5 flex-shrink-0" /> {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-mono text-gray-500">
                        Initiated by: {dispute.initiator_address}
                    </div>
                </div>
            )}

            {/* Role Specific Views (Only if NOT resolved) */}
            {!isResolved && (
                <div className="space-y-4">
                    {isArbiter ? (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-white font-header text-lg mb-2">Issue a Ruling</p>
                                <p className="text-gray-400 text-xs font-mono">As the appointed Arbiter, your decision is binding and final. Review all submitted evidence before proceeding.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    onClick={() => onResolve(true)}
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    icon={<Check className="w-5 h-5" />}
                                >
                                    Release to Freelancer
                                </Button>

                                <Button
                                    onClick={() => onResolve(false)}
                                    variant="ghost"
                                    size="lg"
                                    fullWidth
                                    icon={<Undo2 className="w-5 h-5" />}
                                    className="bg-white/5 text-white hover:bg-white/10 hover:text-white border border-white/10"
                                >
                                    Refund to Client
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <StatusMessage
                                variant="info"
                                title="Awaiting Arbiter Review"
                                message="The appointed Arbiter has been notified and is reviewing all submitted evidence. You will be informed once a ruling has been issued."
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Client/Freelancer Actions - View Details Button */}
            {/* If viewed by a non-arbiter in a disputed state, they see status message above. We can add a refresh button here if needed, or just leave it. */}

            {/* Footer */}
            <div className="mt-8 text-center space-y-4 pt-8 border-t border-white/10">
                <Button
                    onClick={() => window.location.href = `/deal/${deal.id}`}
                    variant="ghost"
                    size="sm"
                    uppercase
                    className="text-gray-500 hover:text-white"
                >
                    ← Back to Deal
                </Button>
                <p className="text-[10px] text-gray-500 font-mono">
                    Powered by ArbiSecure Stylus • Trustless & Secure
                </p>
            </div>

        </motion.div>
    );
}
