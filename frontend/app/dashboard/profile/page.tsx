'use client';

import { useState } from 'react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import Header from '@/components/header';
import Link from 'next/link';

export default function ProfilePage() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    displayName: 'John Developer',
    bio: 'Freelance Web3 Developer - Specialized in Solidity & Frontend',
    avatar: '👨‍💻',
  });
  const [settings, setSettings] = useState({
    twoFA: false,
    emailUpdates: true,
    marketingEmails: false,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    // Mock save
  };

  const address_short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

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
          <span className="text-slate-300">Profile & Settings</span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="text-6xl mb-4">{profile.avatar}</div>
                <h2 className="text-xl font-bold text-white mb-1">{profile.displayName}</h2>
                <p className="text-sm text-slate-400 mb-3 font-mono">{ensName || address_short}</p>
                <div className="text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full">
                  Verified Address
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 border-t border-slate-700 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Deals Completed</span>
                  <span className="text-white font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Success Rate</span>
                  <span className="text-green-400 font-bold">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Total Volume</span>
                  <span className="text-white font-bold">45.5 ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Rating</span>
                  <span className="text-yellow-400 font-bold">4.8 ⭐</span>
                </div>
              </div>

              {/* Rating Badge */}
              <div className="mt-6 bg-linear-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Trusted Contributor</span>
                  <br />
                  <span className="text-xs text-slate-400">12 successful transactions</span>
                </p>
              </div>
            </div>
          </div>

          {/* Settings - Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Profile Information</h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {editMode ? '✕ Cancel' : '✏️ Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Wallet Address</label>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-mono text-sm">
                    {address}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">This cannot be changed</p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    disabled={!editMode}
                    className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 transition ${
                      editMode ? 'hover:border-blue-600 focus:border-blue-500 focus:outline-none' : 'cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    disabled={!editMode}
                    rows={3}
                    className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 resize-none transition ${
                      editMode ? 'hover:border-blue-600 focus:border-blue-500 focus:outline-none' : 'cursor-not-allowed'
                    }`}
                  />
                  <p className="text-xs text-slate-500 mt-2">{profile.bio.length}/200 characters</p>
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Avatar Emoji</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.avatar}
                      onChange={(e) => handleProfileChange('avatar', e.target.value)}
                      disabled={!editMode}
                      maxLength={2}
                      className={`flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white text-center transition ${
                        editMode ? 'hover:border-blue-600 focus:border-blue-500 focus:outline-none' : 'cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Save Button */}
                {editMode && (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    ✓ Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Security & Privacy</h3>

              <div className="space-y-4">
                {/* Two Factor Auth */}
                <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-400 mt-1">Add an extra layer of security</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, twoFA: !prev.twoFA }))
                    }
                    className={`w-12 h-7 rounded-full transition relative ${
                      settings.twoFA ? 'bg-green-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full absolutetransition ${
                        settings.twoFA ? 'right-0.5' : 'left-0.5'
                      }`}
                      style={{ top: '4px' }}
                    />
                  </button>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">Email Updates</p>
                    <p className="text-sm text-slate-400 mt-1">Receive deal and transaction notifications</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, emailUpdates: !prev.emailUpdates }))
                    }
                    className={`w-12 h-7 rounded-full transition relative ${
                      settings.emailUpdates ? 'bg-green-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full absolute transition ${
                        settings.emailUpdates ? 'right-0.5' : 'left-0.5'
                      }`}
                      style={{ top: '4px' }}
                    />
                  </button>
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">Marketing Emails</p>
                    <p className="text-sm text-slate-400 mt-1">Promotions, features, and updates</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, marketingEmails: !prev.marketingEmails }))
                    }
                    className={`w-12 h-7 rounded-full transition relative ${
                      settings.marketingEmails ? 'bg-green-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full absolute transition ${
                        settings.marketingEmails ? 'right-0.5' : 'left-0.5'
                      }`}
                      style={{ top: '4px' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Wallet Management Section */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Wallet Management</h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Connected Wallet</p>
                      <p className="text-sm text-slate-400 mt-1 font-mono">{address_short}</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    disconnect();
                  }}
                  className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg font-medium transition"
                >
                  🔌 Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
