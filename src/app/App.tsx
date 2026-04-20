import { Component, ReactNode } from "react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Shop } from "./components/Shop";
import { TrustSection } from "./components/TrustSection";
import { Testimonials } from "./components/Testimonials";
import { BrandStory } from "./components/BrandStory";
import { CallToAction } from "./components/CallToAction";
import { Footer } from "./components/Footer";
import { FloatingIngredients } from "./components/FloatingIngredients";
import { WhatsAppFAB } from "./components/WhatsAppFAB";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "sonner";

class ErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

export default function App() {
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
          <Navigation />
          <main id="main-content">
            <Hero />
            <ErrorBoundary>
              <Shop />
            </ErrorBoundary>
            <ErrorBoundary>
              <TrustSection />
              <Testimonials />
              <BrandStory />
              <CallToAction />
            </ErrorBoundary>
          </main>
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
          <WhatsAppFAB />
        </div>
      </div>
    </CartProvider>
  );
}
