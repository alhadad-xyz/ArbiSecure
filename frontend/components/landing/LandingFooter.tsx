
export default function LandingFooter() {
    return (
        <footer className="w-full bg-white/5 border-t border-white/10 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6 col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                            <div className="w-4 h-4 bg-white/70 rounded-full -ml-1.5"></div>
                            <div className="w-4 h-4 bg-white/40 rounded-full -ml-1.5"></div>
                        </div>
                        <span className="text-xl font-header tracking-tight">ARBISECURE</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-mono">
                        The leading trustless freelance solution for the modern digital economy. Fast, secure, and intuitive.
                    </p>
                </div>
                <div className="space-y-6">
                    <h4 className="text-white text-sm font-mono uppercase tracking-widest font-bold">Links</h4>
                    <ul className="space-y-4 text-sm text-gray-400 font-mono">
                        <li><a className="hover:text-white transition-colors" href="#">Home</a></li>
                        <li><a className="hover:text-white transition-colors" href="#how-it-works">How It Works</a></li>
                        <li><a className="hover:text-white transition-colors" href="#about">About</a></li>
                        <li><a className="hover:text-white transition-colors" href="#fees">Pricing</a></li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-white text-sm font-mono uppercase tracking-widest font-bold">Social</h4>
                    <ul className="space-y-4 text-sm text-gray-400 font-mono">
                        <li><a className="hover:text-white transition-colors flex items-center gap-2" href="#"><span className="material-symbols-outlined text-base">alternate_email</span> Twitter</a></li>
                        <li><a className="hover:text-white transition-colors flex items-center gap-2" href="#"><span className="material-symbols-outlined text-base">chat</span> Discord</a></li>
                        <li><a className="hover:text-white transition-colors flex items-center gap-2" href="#"><span className="material-symbols-outlined text-base">forum</span> Telegram</a></li>
                        <li><a className="hover:text-white transition-colors flex items-center gap-2" href="#"><span className="material-symbols-outlined text-base">share</span> LinkedIn</a></li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-white text-sm font-mono uppercase tracking-widest font-bold">Documentation</h4>
                    <ul className="space-y-4 text-sm text-gray-400 font-mono">
                        <li><a className="hover:text-white transition-colors" href="#">Whitepaper</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">API Reference</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">GitHub</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-xs font-mono">© 2026 ARBISECURE. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-8">
                    <a className="text-gray-500 hover:text-white text-xs font-mono uppercase transition-colors" href="#">Terms of Service</a>
                    <a className="text-gray-500 hover:text-white text-xs font-mono uppercase transition-colors" href="#">Cookie Policy</a>
                </div>
            </div>
        </footer>
    );
}
