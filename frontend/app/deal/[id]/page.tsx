"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LandingHeader from "@/components/landing/LandingHeader";
import DealReviewUI from "@/components/deal/DealReviewUI";
import type { Deal } from "@/lib/supabase";

export default function DealPage() {
    const params = useParams();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch deal data
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
            } catch (err) {
                console.error('Error fetching deal:', err);
                setError('Deal not found');
            } finally {
                setLoading(false);
            }
        };

        fetchDeal();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white font-mono">
                Loading Deal...
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const dealData = {
        title: deal.title,
        description: deal.description,
        amount: deal.amount,
        freelancer: deal.freelancer,
        arbiter: deal.arbiter,
    };

    return <DealReviewUI dealData={dealData} />;
}
