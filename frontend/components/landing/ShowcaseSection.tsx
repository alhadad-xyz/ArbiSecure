
export default function ShowcaseSection() {
    return (
        <section id="showcase" className="py-12 px-4 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-end mb-8 px-4">
                <h3 className="font-nav text-gray-500">Platform Features</h3>
                <a className="font-nav flex items-center gap-1 hover:text-white transition-colors" href="#">
                    Read Documentation <span className="ml-1">↗</span>
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 group relative rounded-card overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-glass border border-glass-border">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 z-10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 mix-blend-overlay"></div>

                    <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-20">
                        <h2 className="text-3xl md:text-5xl font-header mb-6">
                            RECENT <span className="text-white italic font-serif">ESCROWS</span>
                        </h2>
                        <h4 className="font-header text-3xl md:text-4xl text-white mb-1">Border-less Payments</h4>
                        <p className="font-mono text-gray-300 text-sm">Settle gigs in seconds via Arbitrum. No banking restrictions.</p>
                    </div>
                </div>

                <div className="group relative rounded-card overflow-hidden aspect-square bg-glass border border-glass-border">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    <div className="absolute bottom-8 left-8 z-20">
                        <span className="font-nav bg-white/10 text-white px-2 py-1 rounded-full border border-white/10 mb-3 inline-block">Efficiency</span>
                        <h4 className="font-header text-2xl text-white">Rust Powered</h4>
                        <p className="font-mono text-gray-300 text-xs">Stylus contracts: 10x lower gas.</p>
                    </div>
                </div>

                <div className="group relative rounded-card overflow-hidden aspect-square bg-glass border border-glass-border">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-ad71c4295843?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    <div className="absolute bottom-8 left-8 z-20">
                        <span className="font-nav bg-white/10 text-white px-2 py-1 rounded-full border border-white/10 mb-3 inline-block">Security</span>
                        <h4 className="font-header text-2xl text-white">Audited Logic</h4>
                        <p className="font-mono text-gray-300 text-xs">Funds held by code, not people.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
