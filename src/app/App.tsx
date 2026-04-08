import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Shop } from "./components/Shop";
import { TrustSection } from "./components/TrustSection";
import { BrandStory } from "./components/BrandStory";
import { CallToAction } from "./components/CallToAction";
import { Footer } from "./components/Footer";
import { FloatingIngredients } from "./components/FloatingIngredients";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      {/* Skip to main content — screen reader / keyboard shortcut */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-[#3E2723] focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <div className="min-h-screen relative">
        <FloatingIngredients />
        <div className="relative z-10">
          <Navigation />
          <main id="main-content">
            <Hero />
            <Shop />
            <TrustSection />
            <BrandStory />
            <CallToAction />
          </main>
          <Footer />
        </div>
      </div>
    </CartProvider>
  );
}