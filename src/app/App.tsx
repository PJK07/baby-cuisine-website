import { Component, ReactNode, useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Shop } from "./components/Shop";
import { TrustSection } from "./components/TrustSection";
import { Testimonials } from "./components/Testimonials";
import { BrandStory } from "./components/BrandStory";
import { CallToAction } from "./components/CallToAction";
import { Footer } from "./components/Footer";
import { PrivacyPolicyModal } from "./components/PrivacyPolicyModal";
import { FloatingIngredients } from "./components/FloatingIngredients";
import { WhatsAppFAB } from "./components/WhatsAppFAB";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "sonner";
import { GrowthTracker } from "./components/GrowthTracker";

class ErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

export default function App() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#privacy-policy") {
        setIsPrivacyOpen(true);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handlePrivacyOpenChange = (open: boolean) => {
    setIsPrivacyOpen(open);
    if (!open && window.location.hash === "#privacy-policy") {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <CartProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: "#293313", color: "#fff", borderRadius: "2rem", fontWeight: 600 },
          duration: 2500,
        }}
      />
      {/* Skip to main content — screen reader / keyboard shortcut */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-[#3E2723] focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <div className="min-h-screen relative">
        <ErrorBoundary>
          <FloatingIngredients />
        </ErrorBoundary>
        <div className="relative z-10">
          <ErrorBoundary>
            <Navigation />
          </ErrorBoundary>
          <main id="main-content">
            <ErrorBoundary>
              <Hero />
            </ErrorBoundary>
            <ErrorBoundary>
              <GrowthTracker />
            </ErrorBoundary>
            <ErrorBoundary>
              <Shop />
            </ErrorBoundary>
            <ErrorBoundary>
              <TrustSection />
            </ErrorBoundary>
            <ErrorBoundary>
              <Testimonials />
            </ErrorBoundary>
            <ErrorBoundary>
              <BrandStory />
            </ErrorBoundary>
            <ErrorBoundary>
              <CallToAction />
            </ErrorBoundary>
          </main>
          <ErrorBoundary>
            <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />
          </ErrorBoundary>
          <WhatsAppFAB />
          <PrivacyPolicyModal isOpen={isPrivacyOpen} onOpenChange={handlePrivacyOpenChange} />
        </div>
      </div>
      <Analytics />
    </CartProvider>
  );
}
