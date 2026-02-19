'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
    ArrowRight,
    Plus,
    Search,
    SlidersHorizontal,
    Briefcase,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Trophy,
    Circle,
    Timer,
} from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import { Button, StatusBadge } from '@/components/ui';
import type { Deal, DealStatus } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'client' | 'freelancer' | 'arbiter';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Deals' },
    { id: 'client', label: 'As Client' },
    { id: 'freelancer', label: 'As Freelancer' },
    { id: 'arbiter', label: 'As Arbiter' },
];

// ─── Status Icon helper ───────────────────────────────────────────────────────

function StatusIcon({ status }: { status: DealStatus }) {
    const s = (status as string).toLowerCase();
    if (s === 'completed' || s === 'released') return <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />;
    if (s === 'disputed') return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    if (s === 'resolved') return <Trophy className="w-3.5 h-3.5 text-purple-400" />;
    if (s === 'funded') return <Circle className="w-2.5 h-2.5 fill-green-400 text-green-400" />;
    if (s === 'active') return <Timer className="w-3.5 h-3.5 text-blue-400" />;
    return <Circle className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />;
}

function statusColor(status: DealStatus): string {
    const s = (status as string).toLowerCase();
    if (s === 'completed' || s === 'released') return 'text-blue-400';
    if (s === 'disputed') return 'text-red-400';
    if (s === 'resolved') return 'text-purple-400';
    if (s === 'funded') return 'text-green-400';
    if (s === 'active') return 'text-blue-400';
    return 'text-yellow-400';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DealCardSkeleton() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="h-5 w-48 bg-white/10 rounded-lg" />
                <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
            <div className="h-4 w-3/4 bg-white/10 rounded-lg" />
            <div className="h-2 w-full bg-white/10 rounded-full" />
            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-10 bg-white/10 rounded-xl" />
                <div className="h-10 bg-white/10 rounded-xl" />
            </div>
            <div className="h-10 bg-white/10 rounded-full mt-2" />
        </div>
    );
}

// ─── Deal Card ────────────────────────────────────────────────────────────────

function DealCard({ deal, index }: { deal: Deal; index: number }) {
    const router = useRouter();

    const releasedMilestones = deal.milestones?.filter((m) => m.status === 'released').length ?? 0;
    const totalMilestones = deal.milestones?.length ?? 0;
    const progressPct = totalMilestones > 0 ? (releasedMilestones / totalMilestones) * 100 : 0;

    const truncate = (addr: string) =>
        addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-4
                       hover:bg-white/[0.08] hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)]
                       transition-all duration-300 cursor-pointer"
            onClick={() => router.push(`/deal/${deal.id}`)}
        >
            {/* Top sheen */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
                        Agreement
                    </p>
                    <h3 className="font-header font-bold text-lg text-white leading-tight truncate">
                        {deal.title}
                    </h3>
                </div>

                {/* Status badge */}
                <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider
                               border border-white/10 rounded-full bg-white/5 whitespace-nowrap shrink-0 ${statusColor(deal.status)}`}
                >
                    <StatusIcon status={deal.status} />
                    {deal.status}
                </span>
            </div>

            {/* Description */}
            {deal.description && (
                <p className="text-sm text-gray-400 font-mono leading-relaxed line-clamp-2">
                    {deal.description}
                </p>
            )}

            {/* Amount + Milestone progress */}
            <div className="space-y-2">
                <div className="flex items-end justify-between">
                    <span className="text-2xl font-header font-bold text-white">
                        {deal.amount}{' '}
                        <span className="text-sm font-normal text-gray-400">ETH</span>
                    </span>
                    {totalMilestones > 0 && (
                        <span className="text-xs font-mono text-gray-500">
                            {releasedMilestones}/{totalMilestones} milestones
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                {totalMilestones > 0 && (
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white/60 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.8, delay: index * 0.06 + 0.2 }}
                        />
                    </div>
                )}
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Client</p>
                    <p className="font-mono text-xs text-gray-300">{truncate(deal.client)}</p>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Freelancer</p>
                    <p className="font-mono text-xs text-gray-300">{truncate(deal.freelancer)}</p>
                </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                {deal.created_at && (
                    <span className="text-[11px] font-mono text-gray-600 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(deal.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                )}

                <span className="text-xs font-mono text-gray-400 group-hover:text-white transition-colors flex items-center gap-1">
                    View Details
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
            </div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ connected }: { connected: boolean }) {
    const router = useRouter();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full flex flex-col items-center justify-center py-24 gap-6 text-center"
        >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
                <h3 className="font-header text-xl text-white">No deals found</h3>
                <p className="text-gray-500 font-mono text-sm max-w-sm">
                    {connected
                        ? "You haven't participated in any deals yet. Create your first secure escrow deal."
                        : 'Connect your wallet to see deals associated with your address.'}
                </p>
            </div>
            {connected && (
                <Button
                    variant="primary"
                    size="md"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => router.push('/create')}
                >
                    Create Deal
                </Button>
            )}
        </motion.div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DealsDashboard() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchDeals = async () => {
            setLoading(true);
            try {
                const url = address
                    ? `/api/deals?address=${address}`
                    : '/api/deals';
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch deals');
                const data: Deal[] = await res.json();
                setDeals(data);
            } catch (err) {
                console.error('Error fetching deals:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [address]);

    const filterByRole = (deal: Deal, role: FilterTab, userAddress?: string) => {
        if (role === 'all') return true;
        if (!userAddress) return true; // Should ideally be false if not connected, but 'all' handles that.
        const addr = userAddress.toLowerCase();
        if (role === 'client') return deal.client?.toLowerCase() === addr;
        if (role === 'freelancer') return deal.freelancer?.toLowerCase() === addr;
        if (role === 'arbiter') return deal.arbiter?.toLowerCase() === addr;
        return true;
    };

    const filtered = useMemo(() => {
        let list = deals.filter(d => filterByRole(d, activeTab, address));
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (d) =>
                    d.title.toLowerCase().includes(q) ||
                    d.description?.toLowerCase().includes(q) ||
                    d.client?.toLowerCase().includes(q) ||
                    d.freelancer?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [deals, activeTab, search, address]);

    const tabCount = (tab: FilterTab) => deals.filter(d => filterByRole(d, tab, address)).length;

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans selection:bg-white/20">
            {/* Background ambient blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
                <div className="absolute -bottom-40 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <LandingHeader />

                <main className="flex-grow px-4 py-12 max-w-6xl mx-auto w-full">
                    {/* Page header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
                    >
                        <div>
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
                                Dashboard
                            </p>
                            <h1 className="font-header font-black text-4xl md:text-5xl text-white uppercase">
                                My Deals
                            </h1>
                            <p className="text-gray-400 font-mono text-sm mt-2">
                                {isConnected
                                    ? `Showing deals for ${address?.slice(0, 6)}…${address?.slice(-4)}`
                                    : 'Connect your wallet to filter by your address'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {!isConnected && (
                                <ConnectButton
                                    showBalance={false}
                                    chainStatus="none"
                                    accountStatus="address"
                                />
                            )}
                            <Button
                                variant="primary"
                                size="md"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => router.push('/create')}
                            >
                                New Deal
                            </Button>
                        </div>
                    </motion.div>

                    {/* Toolbar: filters + search */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex flex-col sm:flex-row gap-4 mb-8"
                    >
                        {/* Tab filters */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 flex-wrap">
                            {FILTER_TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200
                                               ${activeTab === tab.id
                                            ? 'text-black'
                                            : 'text-gray-400 hover:text-white'}`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.span
                                            layoutId="tab-pill"
                                            className="absolute inset-0 bg-white rounded-full"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        {tab.label}
                                        <span className={`${activeTab === tab.id ? 'text-black/50' : 'text-gray-600'}`}>
                                            {tabCount(tab.id)}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-xs ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search deals…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2
                                           text-sm font-mono text-white placeholder:text-gray-600
                                           focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                            />
                        </div>
                    </motion.div>

                    {/* Deal grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                            >
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <DealCardSkeleton key={i} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                            >
                                {filtered.length === 0 ? (
                                    <EmptyState connected={isConnected} />
                                ) : (
                                    filtered.map((deal, i) => (
                                        <DealCard key={deal.id} deal={deal} index={i} />
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Footer */}
                <footer className="relative z-10 text-center py-8 border-t border-white/[0.06]">
                    <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                        Powered by{' '}
                        <span className="text-gray-400">ArbiSecure</span>{' '}
                        <span className="text-gray-700">·</span>{' '}
                        Arbitrum Stylus
                    </p>
                </footer>
            </div>
        </div>
    );
}
