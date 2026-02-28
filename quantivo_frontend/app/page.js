import Navbar     from '../components/landing/Navbar';
import Hero       from '../components/landing/Hero';
import About      from '../components/landing/About';
import HowItWorks from '../components/landing/HowItWorks';
import Features   from '../components/landing/Features';
import Contact    from '../components/landing/Contact';
import Footer     from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* 1. Sticky navbar */}
      <Navbar />

      {/* 2. Full-screen hero */}
      <Hero />

      {/* 3. What is Quantivo */}
      <About />

      {/* 4. How it works */}
      <HowItWorks />

      {/* 5. Features */}
      <Features />

      {/* 6. Contact */}
      <Contact />

      {/* 7. Footer + CTA band */}
      <Footer />
    </div>
  );
}