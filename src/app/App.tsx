import { lazy, Suspense } from "react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Shop } from "./components/Shop";
import { WhatsAppFAB } from "./components/WhatsAppFAB";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "sonner";

// Lazy-load everything below the fold — splits them out of the initial bundle
const TrustSection = lazy(() => import("./components/TrustSection").then(m => ({ default: m.TrustSection })));
const Testimonials = lazy(() => import("./components/Testimonials").then(m => ({ default: m.Testimonials })));
const BrandStory = lazy(() => import("./components/BrandStory").then(m => ({ default: m.BrandStory })));
const CallToAction = lazy(() => import("./components/CallToAction").then(m => ({ default: m.CallToAction })));
const Footer = lazy(() => import("./components/Footer").then(m => ({ default: m.Footer })));
const FloatingIngredients = lazy(() => import("./components/FloatingIngredients").then(m => ({ default: m.FloatingIngredients })));

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
        <Suspense fallback={null}>
          <FloatingIngredients />
        </Suspense>
        <div className="relative z-10">
          <Navigation />
          <main id="main-content">
            <Hero />
            <Shop />
            <Suspense fallback={null}>
              <TrustSection />
              <Testimonials />
              <BrandStory />
              <CallToAction />
            </Suspense>
          </main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
          <WhatsAppFAB />
        </div>
      </div>
    </CartProvider>
  );
}
