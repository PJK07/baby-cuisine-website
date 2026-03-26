import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Shop } from "./components/Shop";
import { TrustSection } from "./components/TrustSection";
import { BrandStory } from "./components/BrandStory";
import { Ingredients } from "./components/Ingredients";
import { Testimonials } from "./components/Testimonials";
import { CallToAction } from "./components/CallToAction";
import { Footer } from "./components/Footer";
import { FloatingIngredients } from "./components/FloatingIngredients";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen relative">
        <FloatingIngredients />
        <div className="relative z-10">
          <Navigation />
          <Hero />
          <Shop />
          <TrustSection />
          <BrandStory />
          <Ingredients />
          <Testimonials />
          <CallToAction />
          <Footer />
        </div>
      </div>
    </CartProvider>
  );
}