import LandingHeader from './landing/LandingHeader';
import Ticker from './landing/Ticker';
import HeroSection from './landing/HeroSection';
import MissionSection from './landing/MissionSection';
import ShowcaseSection from './landing/ShowcaseSection';
import ServicesSection from './landing/ServicesSection';
import ProjectListSection from './landing/ProjectListSection';
import LandingFooter from './landing/LandingFooter';
import SecuritySection from './landing/SecuritySection';
import FeesSection from './landing/FeesSection';
import { FadeIn } from './animations/FadeIn';

export default function LandingPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white min-h-screen flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden transition-colors duration-300">
            <LandingHeader />
            <Ticker />
            <main className="flex-grow flex flex-col items-center justify-center w-full">
                <FadeIn className="w-full" delay={0.2}><HeroSection /></FadeIn>
                <FadeIn className="w-full" delay={0.2}><MissionSection /></FadeIn>
                <FadeIn className="w-full" delay={0.2}><ShowcaseSection /></FadeIn>
                <FadeIn className="w-full" delay={0.2}><ServicesSection /></FadeIn>
                <FadeIn className="w-full" delay={0.2}><ProjectListSection /></FadeIn>
                <FadeIn className="w-full" delay={0.2}><SecuritySection /></FadeIn>
                <FadeIn className="w-full" delay={0.2}><FeesSection /></FadeIn>
            </main>
            <LandingFooter />
        </div>
    );
}
