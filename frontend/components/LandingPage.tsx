import LandingHeader from './landing/LandingHeader';
import Ticker from './landing/Ticker';
import HeroSection from './landing/HeroSection';
import CryptoCards from './landing/CryptoCards';
import FeaturesSection from './landing/FeaturesSection';
import HowItWorksSection from './landing/HowItWorksSection';
import SecuritySection from './landing/SecuritySection';
import FeesSection from './landing/FeesSection';

export default function LandingPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white min-h-screen flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden transition-colors duration-300">
            <LandingHeader />
            <Ticker />
            <main className="flex-grow flex flex-col items-center justify-center">
                <HeroSection />
                <CryptoCards />
                <FeaturesSection />
                <HowItWorksSection />
                <SecuritySection />
                <FeesSection />
            </main>
            <div className="h-10"></div>
        </div>
    );
}
