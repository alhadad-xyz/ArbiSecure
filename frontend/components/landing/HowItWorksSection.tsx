
const steps = [
    {
        id: "01",
        title: "Define Terms",
        description: "The service provider configures the agreement — specifying scope, milestones, and payment amount — then generates a secure, unique escrow link.",
    },
    {
        id: "02",
        title: "Fund the Contract",
        description: "The client connects their wallet and deposits the agreed amount into the Stylus smart contract, where it is held in trustless escrow.",
    },
    {
        id: "03",
        title: "Release & Settle",
        description: "Upon milestone completion, the client approves the release. Funds are transferred directly and instantly to the service provider's wallet.",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 px-4 max-w-7xl mx-auto w-full bg-glass rounded-section my-12">
            <div className="text-center mb-16 px-4">
                <h2 className="text-4xl font-header mb-4">How It Works</h2>
                <p className="text-xl text-gray-500 font-serif italic">Structured, transparent payments in three steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8">
                {steps.map((step, index) => (
                    <div key={index} className="relative">
                        <div className="text-8xl font-black text-white/5 font-mono mb-4 absolute -top-10 -left-4 select-none">
                            {step.id}
                        </div>
                        <div className="relative z-10 pt-8">
                            <h3 className="text-2xl font-header mb-4">{step.title}</h3>
                            <p className="text-gray-400 font-mono text-sm">{step.description}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="hidden md:block absolute top-12 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-1/2" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
