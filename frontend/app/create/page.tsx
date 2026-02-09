import CreateDealWizard from "@/components/create/CreateDealWizard";
import LandingHeader from "@/components/landing/LandingHeader";

export default function CreateDealPage() {
    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden font-sans selection:bg-white/20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <LandingHeader />

                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        {/* The Monolith Container */}
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-8 md:p-12 relative overflow-hidden">
                            {/* Subtle internal sheen */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <CreateDealWizard />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
