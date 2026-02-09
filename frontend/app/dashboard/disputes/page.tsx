'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Header from '@/components/header';
import Link from 'next/link';

type Dispute = {
  id: string;
  dealId: string;
  client: string;
  freelancer: string;
  issue: string;
  amount: string;
  currency: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  createdAt: string;
  resolution?: string;
};

export default function DisputesPage() {
  const { address } = useAccount();
  const [disputes] = useState<Dispute[]>([
    {
      id: 'DIS-001',
      dealId: 'DEAL-123',
      client: '0x1234567890123456789012345678901234567890',
      freelancer: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      issue: 'Work does not match specifications',
      amount: '5.0',
      currency: 'ETH',
      status: 'in_review',
      createdAt: 'Feb 6, 2025',
    },
    {
      id: 'DIS-002',
      dealId: 'DEAL-456',
      client: '0x9876543210987654321098765432109876543210',
      freelancer: '0xfedc...ba98',
      issue: 'Late delivery',
      amount: '2.5',
      currency: 'ETH',
      status: 'resolved',
      createdAt: 'Feb 4, 2025',
      resolution: 'Partial refund approved (50%)',
    },
  ]);

  const isArbiter = address === '0x9876543210987654321098765432109876543210';

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'in_review':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'closed':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return '🆕';
      case 'in_review':
        return '👀';
      case 'resolved':
        return '✓';
      case 'closed':
        return '✕';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-400 mb-8">
          <Link href="/dashboard" className="hover:text-slate-300 transition">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Disputes</span>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Disputes</h1>
          <p className="text-slate-400">Manage and resolve deal disputes</p>
        </div>

        {/* Filters & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Open</p>
            <p className="text-3xl font-bold text-yellow-400">1</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">In Review</p>
            <p className="text-3xl font-bold text-blue-400">1</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Resolved</p>
            <p className="text-3xl font-bold text-green-400">1</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-white">7.5 ETH</p>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Issue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <p className="text-white font-mono text-sm">{dispute.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white max-w-xs truncate">{dispute.issue}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 font-medium">
                        {dispute.amount} {dispute.currency}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                          dispute.status
                        )}`}
                      >
                        <span>{getStatusIcon(dispute.status)}</span>
                        <span className="capitalize">{dispute.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm">{dispute.createdAt}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/disputes/${dispute.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {disputes.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <p>No disputes found</p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-linear-to-r from-blue-900/20 via-purple-900/20 to-slate-900/20 border border-slate-700 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-white mb-4">How Disputes Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-slate-300 mb-2">1. Initiate</p>
              <p className="text-slate-400 text-sm">Client initiates dispute during active deal</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-2">2. Review</p>
              <p className="text-slate-400 text-sm">Arbiter reviews evidence from both parties</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-2">3. Resolve</p>
              <p className="text-slate-400 text-sm">Arbiter makes final decision on fund distribution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
