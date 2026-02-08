
const steps = [
    {
        id: "01",
        title: "Create Link",
        description: "Freelancer sets terms (amount, deliverable) and generates a secure escrow link.",
    },
    {
        id: "02",
        title: "Deposit Funds",
        description: "Client connects wallet and deposits USDC into the smart contract via the link.",
    },
    {
        id: "03",
        title: "Release & Pay",
        description: "Work is submitted. Client approves release. Funds transfer instantly.",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 px-4 max-w-7xl mx-auto w-full bg-glass rounded-section my-12">
            <div className="text-center mb-16 px-4">
                <h2 className="text-4xl font-header mb-4">How It Works</h2>
                <p className="text-xl text-gray-500 font-serif italic">Secure payments in 3 simple steps.</p>
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
