
import { SplitText } from "../animations/TextReveal";

export default function MissionSection() {
    return (
        <section id="about" className="py-24 px-4 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24">
                <div className="lg:w-7/12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
                        <span className="font-header block mb-2">At ArbiSecure —</span>
                        <SplitText className="font-serif italic text-gray-400 inline">
                            we believe that trustless payments represent a fundamental shift in how value is exchanged — removing intermediaries, eliminating friction, and restoring financial autonomy to individuals and businesses worldwide.
                        </SplitText>
                    </h2>
                </div>
                <div className="lg:w-4/12 flex flex-col justify-between h-full pt-4">
                    <div className="flex flex-col gap-8">
                        <div>
                            <span className="font-nav text-gray-500 mb-2 block">Mission</span>
                        </div>
                        <p className="font-mono text-sm text-gray-400 leading-relaxed max-w-xs">
                            We combine Arbitrum&apos;s computational efficiency with Rust-based smart contracts to deliver a settlement layer that operates at the speed and scale of global commerce.
                        </p>
                        <a className="inline-flex items-center font-nav hover:text-white transition-colors" href="#">
                            View Documentation <span className="ml-2">→</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
