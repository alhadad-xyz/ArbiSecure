
export default function ProjectListSection() {
    return (
        <section className="py-12 px-6 md:px-12 w-full max-w-7xl mx-auto">
            <div className="relative rounded-[2rem] overflow-hidden bg-transparent aspect-[4/3] md:aspect-[16/7] flex items-center justify-center border border-white/10">
                <div className="absolute inset-0 p-8 md:p-16 flex flex-col md:flex-row justify-between z-10">
                    <div className="space-y-4">
                        <div className="text-white/40 font-mono text-sm">LIVE ON ARBITRUM</div>

                        <div className="group cursor-pointer">
                            <h3 className="text-3xl md:text-5xl font-header text-white/30 group-hover:text-white transition-colors">
                                Smart Contract Audit
                            </h3>
                        </div>

                        <div className="relative group cursor-pointer">
                            <h3 className="text-3xl md:text-5xl font-header text-white">
                                Stylus Integration
                            </h3>
                            <div className="absolute -top-2 -right-6 text-xs text-white/60 font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/20">ACTIVE</div>
                        </div>

                        <div className="group cursor-pointer">
                            <h3 className="text-3xl md:text-5xl font-header text-white/30 group-hover:text-white transition-colors">
                                Zero-Knowledge Circuit
                            </h3>
                        </div>

                        <div className="group cursor-pointer">
                            <h3 className="text-3xl md:text-5xl font-header text-white/30 group-hover:text-white transition-colors">
                                Generative Art Engine
                            </h3>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-8 md:left-16 flex items-center gap-2">
                        <div className="h-8 w-0.5 bg-white/20"></div>
                        <div className="text-white font-mono text-sm">
                            <span className="text-white">$1.2M</span> SECURED
                        </div>
                    </div>
                </div>

                <div className="relative z-0 w-full h-full flex items-center justify-center pointer-events-none">
                    {/* Placeholder for 3D element - replacing the template image with a CSS shape/gradient for now or a generic tech image */}
                    <div className="w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-white/20 via-gray-500 to-black blur-[60px] opacity-20 animate-pulse"></div>
                </div>
            </div>
        </section>
    );
}
