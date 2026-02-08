'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function LandingHeader() {
    return (
        <header className="w-full px-6 py-6 flex items-center justify-between z-50 max-w-7xl mx-auto">
            <div className="flex items-center gap-1 cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full"></div>
                <div className="w-5 h-5 bg-white/70 rounded-full -ml-2"></div>
                <div className="w-5 h-5 bg-white/40 rounded-full -ml-2"></div>
            </div>
            <nav className="hidden md:flex items-center gap-8 font-nav text-gray-400 dark:text-gray-300">
                <a className="hover:text-white transition-colors" href="#features">Features</a>
                <a className="hover:text-white transition-colors" href="#how-it-works">How It Works</a>
                <a className="hover:text-white transition-colors" href="#security">Security</a>
                <a className="hover:text-white transition-colors" href="#fees">Fees</a>
            </nav>
            <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                }) => {
                    // Note: If your app doesn't use authentication, you
                    // can remove all 'authenticationStatus' checks
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                            authenticationStatus === 'authenticated');

                    return (
                        <div
                            {...(!ready && {
                                'aria-hidden': true,
                                'style': {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                },
                            })}
                        >
                            {(() => {
                                if (!connected) {
                                    return (
                                        <button onClick={openConnectModal} type="button" className="bg-primary text-black px-6 py-3 rounded-xl font-bold text-xs tracking-wider hover:scale-105 transition-transform uppercase">
                                            Connect Wallet
                                        </button>
                                    );
                                }

                                if (chain.unsupported) {
                                    return (
                                        <button onClick={openChainModal} type="button" className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs tracking-wider hover:scale-105 transition-transform uppercase">
                                            Wrong network
                                        </button>
                                    );
                                }

                                return (
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            onClick={openChainModal}
                                            style={{ display: 'flex', alignItems: 'center' }}
                                            type="button"
                                            className="bg-white/10 text-white px-4 py-3 rounded-xl font-bold text-xs tracking-wider hover:bg-white/20 transition-all uppercase flex items-center gap-2"
                                        >
                                            {chain.hasIcon && (
                                                <div
                                                    style={{
                                                        background: chain.iconBackground,
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: 999,
                                                        overflow: 'hidden',
                                                        marginRight: 4,
                                                    }}
                                                >
                                                    {chain.iconUrl && (
                                                        <img
                                                            alt={chain.name ?? 'Chain icon'}
                                                            src={chain.iconUrl}
                                                            style={{ width: 12, height: 12 }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            {chain.name}
                                        </button>

                                        <button onClick={openAccountModal} type="button" className="bg-primary text-black px-6 py-3 rounded-xl font-bold text-xs tracking-wider hover:scale-105 transition-transform uppercase">
                                            {account.displayName}
                                            {account.displayBalance
                                                ? ` (${account.displayBalance})`
                                                : ''}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    );
                }}
            </ConnectButton.Custom>
        </header>
    );
}
