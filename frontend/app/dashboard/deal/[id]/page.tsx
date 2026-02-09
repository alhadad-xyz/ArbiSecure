'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import GasCostDisplay from '@/components/gasCostDisplay';
import SavingsComparison from '@/components/savingsComparison';
import TransactionSuccessModal from '@/components/transactionSuccessModal';
import { getOperationGasCost } from '@/lib/gasCalculations';

type Deal = {
  id: string;
  client: string;
  freelancer: string;
  arbiter: string;
  amount: string;
  currency: string;
  status: 'pending' | 'active' | 'disputed' | 'released' | 'resolved';
  createdAt: string;
  txHash?: string;
  scope?: string;
};

type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

export default function DealDetail() {
  const { id } = useParams();
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const devRole = searchParams.get('devRole') as 'client' | 'freelancer' | 'arbiter' | null;
  const devStatus = searchParams.get('devStatus') as 'pending' | 'active' | 'disputed' | 'released' | 'resolved' | null;

  // Development mode - override address for testing
  const testAddresses = {
    client: '0x1234567890123456789012345678901234567890',
    freelancer: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    arbiter: '0x9876543210987654321098765432109876543210',
  };

  const mockAddress = devRole ? testAddresses[devRole] : address;

  // Mock deal data - in production fetch from contract
  const [deal] = useState<Deal>({
    id: String(id),
    client: testAddresses.client,
    freelancer: testAddresses.freelancer,
    arbiter: testAddresses.arbiter,
    amount: '5.0',
    currency: 'ETH',
    status: (devStatus as any) || 'active',
    createdAt: 'Feb 6, 2025',
    txHash: '0x1234...abcd',
    scope: 'Build a modern portfolio website with Next.js and Tailwind CSS',
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    action: 'release' | 'dispute' | 'resolve' | null;
    show: boolean;
  }>({ action: null, show: false });
  const [successModal, setSuccessModal] = useState<{
    action: 'release' | 'dispute' | 'resolve' | null;
    show: boolean;
  }>({ action: null, show: false });

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const isClient = mockAddress?.toLowerCase() === deal.client.toLowerCase();
  const isArbiter = mockAddress?.toLowerCase() === deal.arbiter.toLowerCase();
  const isFreelancer = mockAddress?.toLowerCase() === deal.freelancer.toLowerCase();

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleReleaseFunds = async () => {
    setLoading(true);
    try {
      // TODO: integrate with wagmi writeContract
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConfirmModal({ action: null, show: false });
      // Show success modal after a brief delay
      setTimeout(() => {
        setSuccessModal({ action: 'release', show: true });
      }, 300);
    } catch (error) {
      addToast('error', '✕ Failed to release funds');
      setLoading(false);
    }
  };

  const handleInitiateDispute = async () => {
    setLoading(true);
    try {
      // TODO: integrate with wagmi writeContract
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConfirmModal({ action: null, show: false });
      // Show success modal after a brief delay
      setTimeout(() => {
        setSuccessModal({ action: 'dispute', show: true });
      }, 300);
    } catch (error) {
      addToast('error', '✕ Failed to initiate dispute');
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    setLoading(true);
    try {
      // TODO: integrate with wagmi writeContract
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConfirmModal({ action: null, show: false });
      // Show success modal after a brief delay
      setTimeout(() => {
        setSuccessModal({ action: 'resolve', show: true });
      }, 300);
    } catch (error) {
      addToast('error', '✕ Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Deal['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'active':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'disputed':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'released':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'resolved':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  const getStatusIcon = (status: Deal['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'active':
        return '⚙️';
      case 'disputed':
        return '⚠️';
      case 'released':
        return '✓';
      case 'resolved':
        return '⚖️';
    }
  };

  const arbiscanURL = `https://sepolia.arbiscan.io/tx/${deal.txHash}`;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Development Mode Selector - Testing Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="space-y-3">
              <div>
                <p className="text-yellow-400 font-semibold">🔧 Development Mode - Test Different Scenarios</p>
              </div>

              {/* Role Selector */}
              <div>
                <p className="text-yellow-300 text-sm mb-2">Select Your Role:</p>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={`?devRole=client${devStatus ? `&devStatus=${devStatus}` : ''}`}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      devRole === 'client'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    💼 Client
                  </a>
                  <a
                    href={`?devRole=freelancer${devStatus ? `&devStatus=${devStatus}` : ''}`}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      devRole === 'freelancer'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    🎯 Freelancer
                  </a>
                  <a
                    href={`?devRole=arbiter${devStatus ? `&devStatus=${devStatus}` : ''}`}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      devRole === 'arbiter'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    ⚖️ Arbiter
                  </a>
                  <a
                    href={`${devStatus ? `?devStatus=${devStatus}` : ''}`}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition bg-slate-700 text-slate-300 hover:bg-slate-600"
                  >
                    ↺ Reset Role
                  </a>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <p className="text-yellow-300 text-sm mb-2">Deal Status:</p>
                <div className="flex gap-2 flex-wrap">
                  {['active', 'pending', 'disputed', 'released', 'resolved'].map((status) => (
                    <a
                      key={status}
                      href={`?devStatus=${status}${devRole ? `&devRole=${devRole}` : ''}`}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition capitalize ${
                        devStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {status}
                    </a>
                  ))}
                  <a
                    href={`${devRole ? `?devRole=${devRole}` : ''}`}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition bg-slate-700 text-slate-300 hover:bg-slate-600"
                  >
                    ↺ Reset Status
                  </a>
                </div>
              </div>

              <div className="text-yellow-300 text-xs pt-2 border-t border-yellow-500/20">
                Current: Role=<span className="font-bold">{devRole || 'default'}</span> | 
                Status=<span className="font-bold">{devStatus || 'active'}</span> |
                <span className="ml-2">💡 Try: client + active = Release Funds, client + active = Initiate Dispute, arbiter + disputed = Resolve Dispute</span>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="text-sm text-slate-400 mb-8">
          <a href="/dashboard" className="hover:text-slate-300 transition">
            Dashboard
          </a>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Deal #{deal.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Header */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Deal #{deal.id}</h1>
                  <p className="text-slate-400">Created on {deal.createdAt}</p>
                </div>
                <div className="flex gap-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(deal.status)}`}>
                    <span>{getStatusIcon(deal.status)}</span>
                    <span className="font-semibold capitalize">{deal.status}</span>
                  </div>
                  {/* Your Role Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${
                    isClient 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                      : isFreelancer
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : isArbiter
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    <span>
                      {isClient ? '💼 Client' : isFreelancer ? '🎯 Freelancer' : isArbiter ? '⚖️ Arbiter' : '👁️ Viewing'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              <div className="mb-6 pb-6 border-b border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Total Amount in Escrow</p>
                <p className="text-4xl font-bold text-white">
                  {deal.amount} <span className="text-lg text-slate-400">{deal.currency}</span>
                </p>
              </div>

              {/* Scope */}
              <div>
                <p className="text-slate-400 text-sm mb-2">Scope of Work</p>
                <p className="text-slate-200">{deal.scope}</p>
              </div>
            </div>

            {/* Gas Costs */}
            <GasCostDisplay
              gasUsed={105000}
              gasPrice={0.1}
              savedPercent={62.5}
              layout="full"
            />

            {/* Savings Comparison */}
            <SavingsComparison
              stylusCostUSD={0.0105}
              solidityCostUSD={0.0280}
              savingsPercent={62.5}
              dealAmount={parseFloat(deal.amount)}
            />

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              {/* Client */}
              <div className={`rounded-xl p-6 border ${
                isClient
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isClient ? 'bg-blue-500/30' : 'bg-blue-500/20'
                  }`}>
                    <span className="text-lg">👤</span>
                  </div>
                  <p className={`text-sm font-semibold ${isClient ? 'text-blue-400' : 'text-slate-400'}`}>CLIENT</p>
                </div>
                <p className="text-white font-mono text-sm">{short(deal.client)}</p>
                {isClient && (
                  <p className="text-blue-400 text-sm font-bold mt-2">✓ This is you</p>
                )}
              </div>

              {/* Freelancer */}
              <div className={`rounded-xl p-6 border ${
                isFreelancer
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isFreelancer ? 'bg-purple-500/30' : 'bg-purple-500/20'
                  }`}>
                    <span className="text-lg">💼</span>
                  </div>
                  <p className={`text-sm font-semibold ${isFreelancer ? 'text-purple-400' : 'text-slate-400'}`}>FREELANCER</p>
                </div>
                <p className="text-white font-mono text-sm">{short(deal.freelancer)}</p>
                {isFreelancer && (
                  <p className="text-purple-400 text-sm font-bold mt-2">✓ This is you</p>
                )}
              </div>

              {/* Arbiter */}
              <div className={`rounded-xl p-6 border ${
                isArbiter
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isArbiter ? 'bg-emerald-500/30' : 'bg-emerald-500/20'
                  }`}>
                    <span className="text-lg">⚖️</span>
                  </div>
                  <p className={`text-sm font-semibold ${isArbiter ? 'text-emerald-400' : 'text-slate-400'}`}>ARBITER</p>
                </div>
                <p className="text-white font-mono text-sm">{short(deal.arbiter)}</p>
                {isArbiter && (
                  <p className="text-emerald-400 text-sm font-bold mt-2">✓ This is you</p>
                )}
              </div>

              {/* Transaction */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-lg">🔗</span>
                  </div>
                  <p className="text-slate-400 text-sm font-semibold">TRANSACTION</p>
                </div>
                {deal.txHash ? (
                  <a
                    href={arbiscanURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono text-sm transition"
                  >
                    {short(deal.txHash)} →
                  </a>
                ) : (
                  <p className="text-slate-500 text-sm">Pending...</p>
                )}
              </div>
            </div>

            {/* Role Explanation Info */}
            {isClient && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h4 className="font-bold text-blue-400 mb-2">💼 Your Role: Client</h4>
                <p className="text-blue-300 text-sm">
                  You initiated this deal and hold the funds in escrow. You can release funds when satisfied with the work, or initiate a dispute if there are issues.
                </p>
              </div>
            )}
            {isFreelancer && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                <h4 className="font-bold text-purple-400 mb-2">🎯 Your Role: Freelancer</h4>
                <p className="text-purple-300 text-sm">
                  You are providing services or goods. Once the client is satisfied, they will release the funds to you. If a dispute arises, the arbiter will make the final decision.
                </p>
              </div>
            )}

            {/* FREELANCER - ACTIVE/PENDING: Work Submitted Section */}
            {isFreelancer && deal.status === 'active' && (
              <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/20 border border-slate-700 rounded-xl p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700 px-8 py-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-2">Escrow Milestone #{deal.id.slice(-2)}</h2>
                      <div className="text-slate-400 space-y-1">
                        <p>Deal ID: <span className="font-mono">{deal.id}</span></p>
                        <p>Fixed Price • {deal.amount} {deal.currency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-6xl">💼</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 py-8 space-y-8">
                  {/* Status Badge */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                      <span className="text-lg">⏳</span>
                      <span className="text-yellow-400 font-bold text-sm">STATUS: PENDING RELEASE</span>
                    </div>
                  </div>

                  {/* Main Message */}
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-white">Work Submitted. Waiting for Approval.</h3>
                    <p className="text-slate-300 text-lg leading-relaxed">
                      You have successfully submitted your deliverables for this milestone. We are currently waiting for the client to review, confirm, and release the vault funds to your wallet.
                    </p>
                  </div>

                  {/* Funds Info Card */}
                  <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-semibold">FUNDS IN ESCROW</span>
                      <span className="text-slate-500 text-xs">Locked until release</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-white">
                        {deal.amount} <span className="text-slate-400 text-xl">{deal.currency}</span>
                      </p>
                      <p className="text-slate-400 text-sm">
                        (${(parseFloat(deal.amount) * 2500).toFixed(2)})
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => addToast('info', '📧 Reminder sent to client')}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <span className="text-lg">🔔</span>
                      <span>Remind Client</span>
                    </button>

                    <button
                      onClick={() => addToast('info', '📋 Opening submission details')}
                      disabled={loading}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-500"
                    >
                      <span className="text-lg">📄</span>
                      <span>View Submission</span>
                    </button>
                  </div>

                  {/* Timeline Info */}
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 space-y-3">
                    <p className="font-semibold text-slate-200 text-sm">⏱️ What's Happening</p>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Your work has been submitted and is under review</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-400 font-bold">⏳</span>
                        <span>Waiting for client to review and approve deliverables</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-slate-500 font-bold">→</span>
                        <span>Once approved, funds will be released to your wallet automatically</span>
                      </div>
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-700/20 border border-slate-600 rounded-lg">
                    <span className="text-blue-400">🔒</span>
                    <span className="text-slate-300 text-sm">Funds are locked in a Smart Contract until release.</span>
                  </div>
                </div>
              </div>
            )}
            {isArbiter && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <h4 className="font-bold text-emerald-400 mb-2">⚖️ Your Role: Arbiter</h4>
                <p className="text-emerald-300 text-sm">
                  You are a neutral third party. Your role is only to resolve disputes if the client initiates one. Review both sides and make a fair decision on fund distribution.
                </p>
              </div>
            )}

            {/* CLIENT - ACTIVE: Release Funds / Initiate Dispute Section */}
            {isClient && deal.status === 'active' && (
              <div className="bg-gradient-to-br from-blue-900/20 to-slate-800/50 border border-slate-700 rounded-xl p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600/10 to-slate-800/30 border-b border-slate-700 px-8 py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                      ACTION REQUIRED
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-3">Project Complete?</h2>
                  <p className="text-slate-300 text-lg">
                    Review the deliverables. If satisfied with the work provided, release the escrowed funds to the freelancer.
                  </p>
                </div>

                {/* Content */}
                <div className="px-8 py-8 space-y-8">
                  {/* Escrow Balance Card */}
                  <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-6 space-y-4">
                    <p className="text-slate-400 text-sm font-semibold">ESCROW BALANCE</p>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-white">
                        {deal.amount} <span className="text-slate-400 text-xl">{deal.currency}</span>
                      </p>
                      <p className="text-slate-400 text-sm">
                        (${(parseFloat(deal.amount) * 2500).toFixed(2)})
                      </p>
                    </div>

                    {/* Verification Details */}
                    <div className="pt-4 border-t border-slate-700 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-lg">✓</span>
                        <span className="text-slate-300">Smart Contract Verified</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🎯</span>
                        <span className="text-slate-300">Freelancer: <span className="font-semibold text-white">{short(deal.freelancer)}</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📅</span>
                        <span className="text-slate-300">Created: <span className="font-semibold text-white">{deal.createdAt}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setConfirmModal({ action: 'release', show: true })}
                      disabled={loading}
                      className="group relative px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <span className="text-2xl">💰</span>
                      <div className="text-left">
                        <div className="font-semibold">Release Funds</div>
                        <div className="text-xs opacity-90">To Freelancer</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setConfirmModal({ action: 'dispute', show: true })}
                      disabled={loading}
                      className="group relative px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg border border-red-500/30 hover:border-red-500/50"
                    >
                      <span className="text-2xl">⚠️</span>
                      <div className="text-left">
                        <div className="font-semibold">Initiate Dispute</div>
                        <div className="text-xs opacity-90">Contact Arbiter</div>
                      </div>
                    </button>
                  </div>

                  {/* Info Text */}
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-slate-300 text-sm">
                    <p className="font-semibold text-slate-200 mb-2">💡 What's next?</p>
                    <p>
                      <strong>Release Funds:</strong> If you're satisfied with the deliverables, release the escrow to the freelancer. This action is final and cannot be undone.
                    </p>
                    <p className="mt-2">
                      <strong>Initiate Dispute:</strong> If there are issues with the work, you can initiate a dispute. The arbiter will review both sides and make a final decision.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ARBITER - DISPUTED: Resolve Dispute Section */}
            {isArbiter && deal.status === 'disputed' && (
              <div className="bg-gradient-to-br from-emerald-900/20 to-slate-800/50 border border-slate-700 rounded-xl p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600/10 to-slate-800/30 border-b border-slate-700 px-8 py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded">
                      ACTION REQUIRED
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-3">⚖️ Resolve Dispute</h2>
                  <p className="text-slate-300 text-lg">
                    A dispute has been initiated. Review the case details and make a fair determination on how to distribute the escrowed funds.
                  </p>
                </div>

                {/* Content */}
                <div className="px-8 py-8 space-y-8">
                  {/* Dispute Info Card */}
                  <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-6 space-y-4">
                    <p className="text-slate-400 text-sm font-semibold">DISPUTE INFORMATION</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Deal Amount:</span>
                        <span className="font-bold text-white">{deal.amount} {deal.currency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Client:</span>
                        <span className="font-mono text-slate-300">{short(deal.client)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Freelancer:</span>
                        <span className="font-mono text-slate-300">{short(deal.freelancer)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resolve Button */}
                  <button
                    onClick={() => setConfirmModal({ action: 'resolve', show: true })}
                    disabled={loading}
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition flex items-center justify-center gap-3 shadow-lg"
                  >
                    <span className="text-2xl">⚖️</span>
                    <span>Make Final Decision</span>
                  </button>

                  {/* Info Text */}
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-slate-300 text-sm">
                    <p className="font-semibold text-slate-200 mb-2">📋 Your Responsibilities</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Review evidence from both client and freelancer</li>
                      <li>Make an impartial decision based on the case</li>
                      <li>Determine fund distribution (release full, partial, or refund)</li>
                      <li>This decision is final and irreversible</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETED: Deal Released or Resolved */}
            {(deal.status === 'released' || deal.status === 'resolved') && (
              <div className={`rounded-xl p-8 text-center border ${
                deal.status === 'released'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-purple-500/10 border-purple-500/30'
              }`}>
                <p className={`text-2xl font-bold ${
                  deal.status === 'released'
                    ? 'text-green-400'
                    : 'text-purple-400'
                }`}>
                  {deal.status === 'released' ? '✓ Funds Released' : '⚖️ Dispute Resolved'}
                </p>
                <p className="text-slate-400 mt-2">
                  {deal.status === 'released'
                    ? 'The funds have been successfully released to the freelancer.'
                    : 'The dispute has been resolved. Deal is now complete.'}
                </p>
              </div>
            )}

            {/* OTHER: Waiting for Action */}
            {!isClient && !isArbiter && deal.status !== 'released' && deal.status !== 'resolved' && (
              <div className="p-6 bg-slate-700/30 border border-slate-600 rounded-lg text-center text-slate-400">
                <p>Waiting for client or arbiter action...</p>
              </div>
            )}
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-4">Share Deal</h3>
              <div className="bg-white p-4 rounded-lg mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/deal/${deal.id}`)}`}
                  alt="Deal QR Code"
                  width={150}
                  height={150}
                />
              </div>
              <p className="text-slate-400 text-sm text-center">Scan to share this deal</p>
            </div>

            {/* Info Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Deal Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-white font-medium capitalize">{deal.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-medium">
                    {deal.amount} {deal.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="text-white font-medium">{deal.createdAt}</span>
                </div>
                {deal.txHash && (
                  <div className="pt-3 border-t border-slate-700">
                    <a
                      href={arbiscanURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium transition flex items-center gap-2"
                    >
                      View on Arbiscan →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md shadow-2xl">
            <h4 className="text-xl font-bold text-white mb-4">
              {confirmModal.action === 'release'
                ? '💰 Release Funds?'
                : confirmModal.action === 'dispute'
                ? '⚠️ Initiate Dispute?'
                : '⚖️ Resolve Dispute?'}
            </h4>

            <p className="text-slate-400 mb-6">
              {confirmModal.action === 'release'
                ? 'Release the escrow funds to the freelancer? This action cannot be undone.'
                : confirmModal.action === 'dispute'
                ? 'Initiate a dispute and notify the arbiter. The arbiter will review and make a final decision.'
                : 'Make the final decision on how to distribute the funds. This action is irreversible.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ action: null, show: false })}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmModal.action === 'release') handleReleaseFunds();
                  else if (confirmModal.action === 'dispute') handleInitiateDispute();
                  else if (confirmModal.action === 'resolve') handleResolveDispute();
                }}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg transition font-medium text-white ${
                  confirmModal.action === 'release'
                    ? 'bg-green-600 hover:bg-green-700'
                    : confirmModal.action === 'dispute'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Success Modal */}
      <TransactionSuccessModal
        isOpen={successModal.show}
        onClose={() => {
          setSuccessModal({ action: null, show: false });
          setLoading(false);
        }}
        action={successModal.action}
        amount={deal.amount}
        currency={deal.currency}
        recipientAddress={deal.freelancer}
        transactionHash={deal.txHash}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 space-y-3 z-40">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg border animate-in fade-in slide-in-from-right ${
              toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
