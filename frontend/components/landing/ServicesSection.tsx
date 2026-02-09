
import { FadeInStagger, FadeInStaggerItem } from "../animations/FadeIn";

export default function ServicesSection() {
    return (
        <section id="how-it-works" className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8 px-4">
                <h3 className="font-nav text-gray-500">How It Works</h3>
                <span className="font-nav text-gray-600">3 Simple Steps</span>
            </div>
            <FadeInStagger className="space-y-4">
                {/* Step 1: Initiation */}
                <FadeInStaggerItem className="group relative p-8 md:p-12 bg-transparent rounded-card transition-colors hover:bg-glass-hover border border-glass-border">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="md:w-1/3">
                            <span className="font-mono text-xs text-gray-400 mb-2 block">Step 01</span>
                            <h3 className="text-2xl md:text-3xl font-header text-white group-hover:text-gray-300 transition-colors">
                                Create &<br />Share Link
                            </h3>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg transform group-hover:-rotate-6 transition-transform duration-300 bg-white/5 flex items-center justify-center border border-white/10">
                                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                        </div>
                        <div className="md:w-1/3 text-right md:text-left">
                            <p className="font-mono text-sm text-gray-500 max-w-xs ml-auto md:ml-0">
                                Freelancer defines the terms (amount, deadline) and generates a secure, unique escrow link on Arbitrum.
                            </p>
                        </div>
                    </div>
                </FadeInStaggerItem>

                {/* Step 2: Funding */}
                <FadeInStaggerItem className="group relative p-8 md:p-12 bg-transparent rounded-card transition-colors hover:bg-glass-hover border border-glass-border">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="md:w-1/3">
                            <span className="font-mono text-xs text-gray-400 mb-2 block">Step 02</span>
                            <h3 className="text-2xl md:text-3xl font-header text-white group-hover:text-gray-200 transition-colors">
                                Secure<br />Deposit
                            </h3>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg transform group-hover:rotate-6 transition-transform duration-300 bg-white/5 flex items-center justify-center border border-white/10">
                                <svg className="w-16 h-16 text-gray-400 group-hover:text-gray-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="md:w-1/3 text-right md:text-left">
                            <p className="font-mono text-sm text-gray-500 max-w-xs ml-auto md:ml-0">
                                Client connects their wallet and deposits USDC. Funds are held in a trustless Stylus smart contract.
                            </p>
                        </div>
                    </div>
                </FadeInStaggerItem>

                {/* Step 3: Release */}
                <FadeInStaggerItem className="group relative p-8 md:p-12 bg-transparent rounded-card transition-colors hover:bg-glass-hover border border-glass-border">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="md:w-1/3">
                            <span className="font-mono text-xs text-gray-400 mb-2 block">Step 03</span>
                            <h3 className="text-2xl md:text-3xl font-header text-white group-hover:text-gray-300 transition-colors">
                                Instant<br />Settlement
                            </h3>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg transform group-hover:-rotate-3 transition-transform duration-300 bg-white/5 flex items-center justify-center border border-white/10">
                                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="md:w-1/3 text-right md:text-left">
                            <p className="font-mono text-sm text-gray-500 max-w-xs ml-auto md:ml-0">
                                Work delivered? Client clicks release. Funds transfer directly to the freelancer's wallet instantly.
                            </p>
                        </div>
                    </div>
                </FadeInStaggerItem>
            </FadeInStagger>
        </section>
    );
}
