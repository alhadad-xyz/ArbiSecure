import { X, Check } from "lucide-react";

export default function FeesSection() {
    return (
        <section id="fees" className="py-24 px-4 max-w-7xl mx-auto w-full">
            <div className="bg-transparent border border-glass-border rounded-section p-12 lg:p-24 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-5"></div>
                <h2 className="text-4xl lg:text-6xl font-header mb-8">
                    Transparent Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div className="bg-background-dark p-8 rounded-card border border-glass-border opacity-50 grayscale hover:grayscale-0 transition-all">
                        <h3 className="text-xl font-header mb-4 text-gray-400">Traditional Platforms</h3>
                        <div className="text-4xl font-black mb-2 text-gray-300">5–20%</div>
                        <p className="text-sm text-gray-500">Platform Commission</p>
                        <div className="my-6 border-t border-white/5"></div>
                        <ul className="text-left space-y-2 text-sm text-gray-400">
                            <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0" /> 3–5% Currency Conversion Markup</li>
                            <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0" /> $30+ International Wire Fees</li>
                            <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-400 flex-shrink-0" /> Net-30 to Net-60 Payment Delays</li>
                        </ul>
                    </div>

                    <div className="bg-background-dark p-8 rounded-card border-2 border-white/20 transform scale-105 shadow-2xl shadow-white/5">
                        <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase">Recommended</div>
                        <h3 className="text-xl font-header mb-4 text-white">ArbiSecure</h3>
                        <div className="text-4xl font-black mb-2 text-white">0.5%</div>
                        <p className="text-sm text-gray-400">Protocol Fee</p>
                        <div className="my-6 border-t border-white/10"></div>
                        <ul className="text-left space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> Market Rate Exchange (No Markup)</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> &lt;$0.01 Gas Fees on Arbitrum</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0" /> Instant On-Chain Settlement</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
