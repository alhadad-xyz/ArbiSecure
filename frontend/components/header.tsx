'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">ArbiSecure</h1>
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
