'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Header from '@/components/header';
import Link from 'next/link';

type Project = {
  id: string;
  title: string;
  client: string;
  freelancer: string;
  amount: string;
  currency: string;
  status: 'active' | 'completed' | 'disputed' | 'pending';
  createdAt: string;
};

type NavItem = {
  title: string;
  icon: string;
  href: string;
  badge?: number;
  arbiterOnly?: boolean;
};

export default function Dashboard() {
  const { address } = useAccount();
  
  const isArbiter = address === '0x4b07763de7bd8ee5c41cb6e98370c5ec319b3253';

  const navItems: NavItem[] = [
    { title: 'Dashboard', icon: '📊', href: '/dashboard' },
    { title: 'Create Deal', icon: '➕', href: '/dashboard/create-deal' },
    { title: 'Disputes', icon: '⚖️', href: '/dashboard/disputes', badge: 3 },
    { title: 'History', icon: '📜', href: '/dashboard/history' },
    { title: 'Gas Comparison', icon: '⛽', href: '/dashboard/gas-comparison' },
    { title: 'Profile', icon: '👤', href: '/dashboard/profile' },
    ...(isArbiter ? [{ title: 'Vault Settings', icon: '🔐', href: '/dashboard/admin' }] : []),
    { title: 'Help & FAQ', icon: '❓', href: '/dashboard/help' },
  ];

  const [projects] = useState<Project[]>([
    {
      id: 'DEAL-1707250800000',
      title: 'Build Portfolio Site',
      client: '0x1234...5678',
      freelancer: '0xabcd...ef00',
      amount: '5.0',
      currency: 'ETH',
      status: 'active',
      createdAt: 'Feb 6, 2025',
    },
    {
      id: 'DEAL-1707164400000',
      title: 'Mobile App UI Design',
      client: '0x9876...5432',
      freelancer: '0xfedc...ba98',
      amount: '2.5',
      currency: 'ETH',
      status: 'completed',
      createdAt: 'Feb 5, 2025',
    },
    {
      id: 'DEAL-1707078000000',
      title: 'Smart Contract Audit',
      client: address || '0x0000...0000',
      freelancer: '0x1111...2222',
      amount: '10',
      currency: 'USDC',
      status: 'pending',
      createdAt: 'Feb 4, 2025',
    },
  ]);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'disputed':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '⚙️';
      case 'completed':
        return '✓';
      case 'disputed':
        return '⚠️';
      case 'pending':
        return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Main Layout with Sidebar */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Menu</h2>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700 transition text-slate-300 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    {item.badge && (
                      <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {item.badge}
                      </div>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <div className="text-sm text-slate-400 mb-8">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span className="text-slate-300">Dashboard</span>
            </div>

            {/* Page Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-slate-400">Manage your escrow deals and projects</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Active Deals</p>
            <p className="text-3xl font-bold text-white">3</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Completed</p>
            <p className="text-3xl font-bold text-white">12</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">Total Volume</p>
            <p className="text-3xl font-bold text-white">45.8 ETH</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
            <p className="text-emerald-400 text-sm mb-2">💰 Gas Saved (vs Ethereum)</p>
            <p className="text-3xl font-bold text-emerald-400">62.5%</p>
            <p className="text-emerald-300 text-xs mt-2">Stylus WASM advantage</p>
          </div>
        </div>

        {/* Gas Info Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">⛽ Arbitrum Stylus Efficiency</h3>
              <p className="text-slate-300 text-sm">Your transactions cost 62.5% less than traditional Solidity on Ethereum thanks to WASM compilation.</p>
            </div>
            <Link
              href="/dashboard/gas-comparison"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition whitespace-nowrap ml-4"
            >
              View Analysis →
            </Link>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
            <a
              href="/dashboard/create-deal"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              + New Deal
            </a>
          </div>

          {/* Projects Table */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Your Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-400">⛽ Gas Cost</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => {
                    const isClient = address?.toLowerCase() === project.client.toLowerCase();
                    const isFreelancer = address?.toLowerCase() === project.freelancer.toLowerCase();
                    let userRole = 'Spectator';
                    let roleColor = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
                    let roleIcon = '👁️';
                    
                    if (isClient) {
                      userRole = 'Client';
                      roleColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                      roleIcon = '💼';
                    } else if (isFreelancer) {
                      userRole = 'Freelancer';
                      roleColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                      roleIcon = '🎯';
                    }
                    
                    return (
                    <tr key={project.id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{project.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{project.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${roleColor}`}>
                          <span>{roleIcon}</span>
                          <span>{userRole}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">
                          {project.amount} {project.currency}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                            project.status
                          )}`}
                        >
                          <span>{getStatusIcon(project.status)}</span>
                          <span className="capitalize">{project.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded text-xs font-semibold w-fit">
                          ~$0.01
                        </div>
                        <p className="text-slate-500 text-xs mt-1">Save 62.5% vs Ethereum</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-400 text-sm">{project.createdAt}</p>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/dashboard/deal/${project.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State (if no projects) */}
          {projects.length === 0 && (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
              <p className="text-slate-400 mb-4">No projects yet</p>
              <a
                href="/dashboard/create-deal"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Create Your First Deal
              </a>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-700 last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Deal Completed</p>
                  <p className="text-sm text-slate-400 mt-1">Mobile App UI Design - 2.5 ETH released</p>
                  <p className="text-xs text-slate-500 mt-2">2 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-slate-700">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                  <span className="text-lg">⏳</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Deal Created</p>
                  <p className="text-sm text-slate-400 mt-1">Smart Contract Audit - 10 USDC escrow initiated</p>
                  <p className="text-xs text-slate-500 mt-2">3 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <span className="text-lg">💰</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Funds Deposited</p>
                  <p className="text-sm text-slate-400 mt-1">Build Portfolio Site - 5.0 ETH deposited</p>
                  <p className="text-xs text-slate-500 mt-2">1 week ago</p>
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
