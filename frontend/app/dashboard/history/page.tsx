'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Header from '@/components/header';
import Link from 'next/link';

type Transaction = {
  id: string;
  dealId: string;
  type: 'deposit' | 'release' | 'refund' | 'fee' | 'dispute_award';
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  from: string;
  to: string;
  timestamp: string;
  description: string;
};

export default function HistoryPage() {
  const { address } = useAccount();
  const [filteredStatus, setFilteredStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TX-001',
      dealId: 'DEAL-123',
      type: 'release',
      amount: '5.0',
      currency: 'ETH',
      status: 'completed',
      from: '0x1234567890123456789012345678901234567890',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      timestamp: 'Feb 6, 2025 2:30 PM',
      description: 'Funds released to freelancer',
    },
    {
      id: 'TX-002',
      dealId: 'DEAL-456',
      type: 'deposit',
      amount: '2.5',
      currency: 'ETH',
      status: 'completed',
      from: '0x9876543210987654321098765432109876543210',
      to: '0xfedc...ba98',
      timestamp: 'Feb 4, 2025 10:15 AM',
      description: 'Deal escrow deposit',
    },
    {
      id: 'TX-003',
      dealId: 'DEAL-456',
      type: 'dispute_award',
      amount: '1.25',
      currency: 'ETH',
      status: 'completed',
      from: 'ArbiSecure Vault',
      to: '0x9876543210987654321098765432109876543210',
      timestamp: 'Feb 5, 2025 4:45 PM',
      description: 'Partial refund (50%) from dispute resolution',
    },
    {
      id: 'TX-004',
      dealId: 'DEAL-789',
      type: 'deposit',
      amount: '3.0',
      currency: 'ETH',
      status: 'pending',
      from: '0x1234567890123456789012345678901234567890',
      to: '0xfedc...ba98',
      timestamp: 'Feb 7, 2025 11:20 AM',
      description: 'Deal escrow deposit',
    },
    {
      id: 'TX-005',
      dealId: 'DEAL-001',
      type: 'fee',
      amount: '0.05',
      currency: 'ETH',
      status: 'completed',
      from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      to: 'ArbiSecure Vault',
      timestamp: 'Feb 3, 2025 9:30 AM',
      description: 'Platform fee (1%)',
    },
  ]);

  const filtered = filteredStatus === 'all' ? transactions : transactions.filter((tx) => tx.status === filteredStatus);

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return '📥';
      case 'release':
        return '📤';
      case 'refund':
        return '↩️';
      case 'fee':
        return '🔧';
      case 'dispute_award':
        return '⚖️';
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'text-blue-400';
      case 'release':
        return 'text-green-400';
      case 'refund':
        return 'text-yellow-400';
      case 'fee':
        return 'text-slate-400';
      case 'dispute_award':
        return 'text-purple-400';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
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
          <span className="text-slate-300">Transaction History</span>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-slate-400">View all your transactions and activities</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Deals</p>
            <p className="text-3xl font-bold text-white">5</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Volume</p>
            <p className="text-3xl font-bold text-blue-400">10.75 ETH</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-400">4</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">1</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {['all', 'pending', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilteredStatus(status as typeof filteredStatus)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filteredStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`text-3xl ${getTypeColor(tx.type)}`}>{getTypeIcon(tx.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold mb-1">{tx.description}</p>
                    <p className="text-sm text-slate-400">
                      {tx.dealId} · {tx.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {tx.amount} {tx.currency}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold mt-2 ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      <span className="capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400 hidden md:block">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">FROM</p>
                    <p className="text-slate-300 font-mono break-all text-xs">{tx.from.slice(0, 20)}...</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">TO</p>
                    <p className="text-slate-300 font-mono break-all text-xs">{tx.to.slice(0, 20)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs mb-1">TX ID</p>
                    <p className="text-slate-300 font-mono text-xs">{tx.id}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p>No transactions found</p>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="mt-12 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">
              📊 Export as CSV
            </button>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition">
              📋 Export as JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
