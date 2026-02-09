'use client';

import { useState } from 'react';
import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import WalletDropdown from './walletDropdown';

export default function Header() {
    const { address } = useAccount();
    const { openConnectModal } = useConnectModal() || {};
    const { disconnect } = useDisconnect();
    const chainId = useChainId();

    const getChainName = (id: number) => {
        switch (id) {
            case 421614:
                return 'Arbitrum Sepolia';
            case 42161:
                return 'Arbitrum One';
            default:
                return `Chain ${id}`;
        }
    };

    const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'My Jobs', href: '#' },
        { label: 'Wallet', href: '#' },
        { label: 'Messages', href: '#' },
    ];

    return (
        <header className="sticky top-0 bg-slate-900 border-b border-slate-800 z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between overflow-visible">
                    {/* Left - Logo */}
                    <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-sm">⚖️</span>
                        </div>
                        <h1 className="text-lg font-bold text-white">EscrowSecure</h1>
                    </a>

                    {/* Center - Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-sm text-slate-400 hover:text-slate-200 transition font-medium"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right - Actions */}
                    <div className="flex items-center gap-4 relative overflow-visible z-50">
                        {/* Chain Indicator */}
                        <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                            <span className="w-2 h-2 rounded-full bg-orange-400" />
                            <span className="text-xs text-slate-300 font-medium">{getChainName(chainId)}</span>
                        </div>

                        {/* Notifications */}
                        <button className="text-slate-400 hover:text-slate-200 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Settings */}
                        <button className="text-slate-400 hover:text-slate-200 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {/* Shared Wallet Dropdown - avatar only in header */}
                        <WalletDropdown address={address} openConnectModal={openConnectModal} disconnect={disconnect} showBadge={false} />
                    </div>
                </div>
            </div>
        </header>
    );
}
