
const features = [
    {
        title: "Stylus Efficiency",
        description: "Powered by Arbitrum Stylus, our smart contracts are written in Rust for maximum performance and minimal gas costs. Save up to 80% compared to standard EVM escrows.",
        icon: (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        title: "Instant Settlement",
        description: "No more waiting for Net-30 terms. Funds are locked in the smart contract and released instantly to your wallet upon job completion.",
        icon: (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: "Global Reach",
        description: "Work with anyone, anywhere. ArbiSecure separates the payment layer from banking restrictions, enabling true borderless collaboration.",
        icon: (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

import { FadeInStagger, FadeInStaggerItem } from "../animations/FadeIn";

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 px-4 max-w-7xl mx-auto w-full">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-header mb-6">
                    BUILT FOR THE <span className="text-white italic font-serif">MODERN</span> ECONOMY
                </h2>
                <p className="text-xl text-gray-500 font-serif italic">The trustless layer for modern work.</p>
            </div>
            <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <FadeInStaggerItem key={index} className="p-8 rounded-card bg-glass border border-glass-border hover:border-white/20 transition-all hover:-translate-y-1 hover:bg-glass-hover group">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                            <span className="material-symbols-outlined text-white group-hover:text-black transition-colors duration-300">
                                {feature.icon}
                            </span>
                        </div>
                        <h3 className="text-xl font-header mb-3">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed font-mono text-sm">{feature.description}</p>
                    </FadeInStaggerItem>
                ))}
            </FadeInStagger>
        </section>
    );
}
