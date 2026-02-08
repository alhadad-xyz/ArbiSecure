export default function FeesSection() {
    return (
        <section id="fees" className="py-24 px-4 max-w-7xl mx-auto w-full">
            <div className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border border-glass-border rounded-section p-12 lg:p-24 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-5"></div>
                <h2 className="text-4xl lg:text-6xl font-header mb-8">
                    Zero Hidden Fees
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div className="bg-background-dark p-8 rounded-card border border-glass-border opacity-50 grayscale hover:grayscale-0 transition-all">
                        <h3 className="text-xl font-header mb-4 text-gray-400">Legacy Platforms</h3>
                        <div className="text-4xl font-black mb-2 text-gray-300">5-20%</div>
                        <p className="text-sm text-gray-500">Platform Fee</p>
                        <div className="my-6 border-t border-white/5"></div>
                        <ul className="text-left space-y-2 text-sm text-gray-400">
                            <li>❌ 3-5% Exchange Rate Markup</li>
                            <li>❌ $30 Wire Transfer Fees</li>
                            <li>❌ Net-30/60 Payment Terms</li>
                        </ul>
                    </div>

                    <div className="bg-background-dark p-8 rounded-card border-2 border-accent-green transform scale-105 shadow-2xl shadow-accent-green/20">
                        <div className="absolute top-0 right-0 bg-accent-green text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase">Recommended</div>
                        <h3 className="text-xl font-header mb-4 text-white">ArbiSecure</h3>
                        <div className="text-4xl font-black mb-2 text-accent-green">0.1%</div>
                        <p className="text-sm text-gray-400">Protocol Fee</p>
                        <div className="my-6 border-t border-white/10"></div>
                        <ul className="text-left space-y-2 text-sm text-gray-300">
                            <li>✅ Actual Market Rate (No Markup)</li>
                            <li>✅ &lt;$0.01 Gas Fees (Arbitrum)</li>
                            <li>✅ Instant Settlement</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
