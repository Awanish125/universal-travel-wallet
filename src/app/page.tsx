import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { HowItWorks } from '../components/landing/HowItWorks';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen text-text-primary">
      <Navbar />
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <CTASection />
      <Footer />
    </main>
  );
}
