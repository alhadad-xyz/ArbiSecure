import { MaskText } from "../animations/TextReveal";
import TransitionLink from "../animations/TransitionLink";

export default function HeroSection() {
    return (
        <section className="flex-grow flex flex-col items-center justify-center px-4 md:px-0 max-w-7xl mx-auto w-full">
            <div className="text-center mb-16 space-y-2 md:space-y-4">
                <div className="text-5xl md:text-8xl leading-none tracking-tight font-header hidden md:block">
                    <MaskText delay={0}>
                        <span className="font-header">ARBISECURE</span> <span className="font-serif italic font-light text-gray-400">IS THE</span>
                    </MaskText>
                    <MaskText delay={0.1}>
                        <span className="font-serif">TRUSTLESS</span> <span className="font-header">ESCROW</span>
                    </MaskText>
                    <MaskText delay={0.2}>
                        <span className="font-header">FOR</span> <span className="font-serif font-light text-gray-300">THE</span> <span className="font-header">GLOBAL</span> <span className="font-serif">ECONOMY</span>
                    </MaskText>
                </div>
                {/* Mobile Fallback (simpler) */}
                <h1 className="text-5xl leading-tight tracking-tight md:hidden">
                    <span className="font-header">ARBISECURE</span> <span className="font-serif italic font-light text-gray-400">IS THE</span>
                    <br />
                    <span className="font-serif">TRUSTLESS</span> <span className="font-header">ESCROW</span>
                    <br />
                    <span className="font-header">FOR</span> <span className="font-serif font-light text-gray-300">THE</span> <span className="font-header">GLOBAL</span> <span className="font-serif">ECONOMY</span>
                </h1>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-20">
                <TransitionLink href="/create"
                    className="group relative flex items-center justify-between border border-glass-border rounded-full pl-2 pr-6 py-2 bg-transparent hover:bg-glass-hover transition-all font-nav w-48 h-14">
                    <div
                        className="flex items-center justify-center w-10 h-10 bg-white rounded-full mr-3 group-hover:scale-90 transition-transform">
                        <div className="flex gap-0.5">
                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                        </div>
                    </div>
                    <span>Start Escrow</span>
                </TransitionLink>
                <button
                    className="flex items-center justify-between bg-white text-black rounded-full pl-6 pr-2 py-2 hover:bg-gray-200 transition-all font-nav font-bold w-48 h-14">
                    <span>Deposit Now</span>
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center ml-3">
                        {/* Simple arrow icon to replace Material Icons for now */}
                        <svg className="w-5 h-5 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </button>
            </div>
        </section>
    );
}
