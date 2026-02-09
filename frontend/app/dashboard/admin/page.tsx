'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Header from '@/components/header';
import Link from 'next/link';

type ArbiterStats = {
  activeDisputes: number;
  resolvedDisputes: number;
  totalFeesEarned: string;
  totalFeesEarnedCurrency: string;
};

export default function AdminPage() {
  const { address } = useAccount();
  
  // Only show if user is an arbiter
  const isArbiter = address === '0x9876543210987654321098765432109876543210';

  const [stats] = useState<ArbiterStats>({
    activeDisputes: 3,
    resolvedDisputes: 18,
    totalFeesEarned: '2.45',
    totalFeesEarnedCurrency: 'ETH',
  });

  const [settings, setSettings] = useState({
    platformFee: 1.0,
    arbiterFeeShare: 0.3,
    autoResolveAfterDays: 14,
    disputeReviewTimeHours: 48,
  });

  const [editMode, setEditMode] = useState(false);

  const handleSettingChange = (key: string, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!isArbiter) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-400 mb-6">This page is only available to authorized arbiters.</p>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <span className="text-slate-300">Vault & Admin Settings</span>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Vault Management</h1>
              <p className="text-slate-400">Configure platform settings and view vault statistics</p>
            </div>
            <div className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-400 rounded-lg text-sm font-semibold">
              🔐 Arbiter Access
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-linear-to-br from-blue-900/20 to-slate-900/20 border border-blue-700/30 rounded-xl p-8">
            <p className="text-slate-400 text-sm mb-2">Active Disputes Under Review</p>
            <p className="text-5xl font-bold text-blue-400">{stats.activeDisputes}</p>
            <p className="text-slate-500 text-sm mt-4">Awaiting arbiter resolution</p>
          </div>

          <div className="bg-linear-to-br from-green-900/20 to-slate-900/20 border border-green-700/30 rounded-xl p-8">
            <p className="text-slate-400 text-sm mb-2">Resolved Disputes</p>
            <p className="text-5xl font-bold text-green-400">{stats.resolvedDisputes}</p>
            <p className="text-slate-500 text-sm mt-4">Successfully mediated</p>
          </div>

          <div className="bg-linear-to-br from-purple-900/20 to-slate-900/20 border border-purple-700/30 rounded-xl p-8">
            <p className="text-slate-400 text-sm mb-2">Arbiter Fee Share</p>
            <p className="text-5xl font-bold text-purple-400">
              {stats.totalFeesEarned} {stats.totalFeesEarnedCurrency}
            </p>
            <p className="text-slate-500 text-sm mt-4">Earned this period</p>
          </div>

          <div className="bg-linear-to-br from-amber-900/20 to-slate-900/20 border border-amber-700/30 rounded-xl p-8">
            <p className="text-slate-400 text-sm mb-2">Success Rate</p>
            <p className="text-5xl font-bold text-amber-400">99.5%</p>
            <p className="text-slate-500 text-sm mt-4">Fair resolutions delivered</p>
          </div>
        </div>

        {/* Main Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Configuration */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Platform Configuration</h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {editMode ? '✕ Cancel' : '⚙️ Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Platform Fee */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Platform Fee (%)
                    <span className="text-slate-500 text-xs ml-2">{settings.platformFee}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={settings.platformFee}
                    onChange={(e) => handleSettingChange('platformFee', parseFloat(e.target.value))}
                    disabled={!editMode}
                    className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-${editMode ? 'pointer' : 'not-allowed'}`}
                  />
                  <p className="text-xs text-slate-500 mt-2">Fee charged on all successful deals</p>
                </div>

                {/* Arbiter Fee Share */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Arbiter Fee Share (%)
                    <span className="text-slate-500 text-xs ml-2">{settings.arbiterFeeShare * 100}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.arbiterFeeShare}
                    onChange={(e) => handleSettingChange('arbiterFeeShare', parseFloat(e.target.value))}
                    disabled={!editMode}
                    className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-${editMode ? 'pointer' : 'not-allowed'}`}
                  />
                  <p className="text-xs text-slate-500 mt-2">Arbiter commission on disputed deals</p>
                </div>

                {/* Auto Resolve Days */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Auto-Resolve After (days)
                    <span className="text-slate-500 text-xs ml-2">{settings.autoResolveAfterDays} days</span>
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="30"
                    step="1"
                    value={settings.autoResolveAfterDays}
                    onChange={(e) => handleSettingChange('autoResolveAfterDays', parseInt(e.target.value))}
                    disabled={!editMode}
                    className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-${editMode ? 'pointer' : 'not-allowed'}`}
                  />
                  <p className="text-xs text-slate-500 mt-2">Disputes auto-resolve if no action taken</p>
                </div>

                {/* Dispute Review Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Dispute Review Time (hours)
                    <span className="text-slate-500 text-xs ml-2">{settings.disputeReviewTimeHours}h</span>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="72"
                    step="6"
                    value={settings.disputeReviewTimeHours}
                    onChange={(e) => handleSettingChange('disputeReviewTimeHours', parseInt(e.target.value))}
                    disabled={!editMode}
                    className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-${editMode ? 'pointer' : 'not-allowed'}`}
                  />
                  <p className="text-xs text-slate-500 mt-2">Target time for arbiter to review disputes</p>
                </div>

                {editMode && (
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">
                    ✓ Save Configuration
                  </button>
                )}
              </div>
            </div>

            {/* Recent Disputes Queue */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Disputes Awaiting Review</h3>

              <div className="space-y-3">
                {[
                  { id: 'DIS-001', deal: 'DEAL-123', parties: '0x1234... ↔️ 0xabcd...', status: '2h ago' },
                  { id: 'DIS-002', deal: 'DEAL-789', parties: '0x9876... ↔️ 0xfedc...', status: '5h ago' },
                  { id: 'DIS-003', deal: 'DEAL-456', parties: '0x5555... ↔️ 0x7777...', status: '12h ago' },
                ].map((dispute) => (
                  <div key={dispute.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:bg-slate-900 transition">
                    <div>
                      <p className="font-semibold text-white">{dispute.id}</p>
                      <p className="text-xs text-slate-400 mt-1">{dispute.parties}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{dispute.status}</p>
                      <Link
                        href={`/dashboard/disputes/${dispute.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 inline-block transition"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-24">
              <h4 className="font-bold text-white mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <Link
                  href="/dashboard/disputes"
                  className="flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white"
                >
                  <span>⚖️</span>
                  <span className="text-sm font-medium">View All Disputes</span>
                </Link>
                <button className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white">
                  <span>📊</span>
                  <span className="text-sm font-medium">View Analytics</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white">
                  <span>💰</span>
                  <span className="text-sm font-medium">Withdraw Fees</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white">
                  <span>📝</span>
                  <span className="text-sm font-medium">View Logs</span>
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h4 className="font-bold text-white mb-4">This Period</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Disputes Resolved</span>
                  <span className="text-white font-bold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Resolution Time</span>
                  <span className="text-white font-bold">18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Volume Mediated</span>
                  <span className="text-white font-bold">45.2 ETH</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-700 mt-3">
                  <span className="text-slate-400">Your Fee Share</span>
                  <span className="text-green-400 font-bold">0.45 ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
