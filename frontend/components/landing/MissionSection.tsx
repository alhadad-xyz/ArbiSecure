
import { SplitText } from "../animations/TextReveal";

export default function MissionSection() {
    return (
        <section id="about" className="py-24 px-4 max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24">
                <div className="lg:w-7/12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
                        <span className="font-header block mb-2">At ArbiSecure —</span>
                        <SplitText className="font-serif italic text-gray-400 inline">
                            we believe that trustless payments are not just about code but also about creating seamless and empowering financial freedom.
                        </SplitText>
                    </h2>
                </div>
                <div className="lg:w-4/12 flex flex-col justify-between h-full pt-4">
                    <div className="flex flex-col gap-8">
                        <div>
                            <span className="font-nav text-gray-500 mb-2 block">Mission</span>
                        </div>
                        <p className="font-mono text-sm text-gray-400 leading-relaxed max-w-xs">
                            We combine Arbitrum's efficiency with rust-based smart contracts to deliver a settlement layer that works at the speed of global business.
                        </p>
                        <a className="inline-flex items-center font-nav hover:text-white transition-colors" href="#">
                            Read Manifest <span className="ml-2">→</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
