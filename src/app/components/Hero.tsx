const heroBanner = '/images/hero-banner.webp';
import { FALLBACK_IMAGE } from "../constants";
import { Heart, Leaf } from "lucide-react";
const logoImage560 = "/images/logo-560w.webp";
const logoImage280 = "/images/logo-280w.webp";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-bg/30 px-6 py-20 pt-32">
      {/* Background shapes */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-brand-primary rounded-full opacity-15 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-brand-accent rounded-full opacity-15 blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="mb-8 inline-block lg:hidden">
              <img
                src={logoImage560}
                srcSet={`${logoImage280} 280w, ${logoImage560} 560w`}
                sizes="280px"
                alt="The Baby Cuisine logo"
                className="w-44 h-auto mx-auto drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                decoding="async"
                width={280}
                height={280}
              />
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-brand-dark mb-6 leading-[1.1]">
              Made with Love,
              <br />
              <span className="text-brand-primary">for Their First Bites</span>
            </h1>

            <p className="text-xl lg:text-2xl text-brand-dark/80 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Pure, soft, and nutrient-dense meals crafted for your little ones —
              because your baby deserves the best!
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10">
              <button
                onClick={() => {
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-brand-primary text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-brand-primary-hover transition-all shadow-xl hover:shadow-2xl"
              >
                Explore Menu
              </button>
            </div>

            <div className="flex flex-wrap gap-8 justify-center lg:justify-start text-brand-dark/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-brand-primary-dark text-brand-primary-dark" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-brand-dark">Handmade</div>
                  <div className="text-sm text-brand-dark/70">by a hospital-graded chef</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-accent/20 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-brand-accent-dark" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-brand-dark">Premium Ingredients</div>
                  <div className="text-sm text-brand-dark/70">Baby-friendly</div>
                </div>
              </div>

            </div>
          </div>

          {/* Right content */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroBanner}
                alt="Assortment of Baby Cuisine fresh handmade baby food products"
                className="rounded-[2rem] shadow-2xl w-full max-w-lg mx-auto"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                // @ts-expect-error lowercase fetchpriority is needed for Lighthouse, not supported in React 18 types
                fetchpriority="high"
                decoding="async"
                width={800}
                height={1000}
              />
            </div>

            {/* Trust badges — inset on mobile so they never overflow the container */}
            <div className="absolute top-3 right-3 sm:-top-6 sm:-right-6 bg-white text-brand-dark px-4 py-3 sm:px-6 sm:py-4 rounded-3xl shadow-2xl z-20">
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold text-brand-accent leading-tight">100% Natural</div>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 sm:-bottom-6 sm:-left-6 bg-white text-brand-dark px-4 py-3 sm:px-6 sm:py-4 rounded-3xl shadow-2xl z-20">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-primary">0</div>
                <div className="text-xs sm:text-sm font-medium">Salt &amp; Sugar</div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-br from-brand-primary/30 to-brand-primary-hover/30 rounded-full blur-2xl" />
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-gradient-to-br from-brand-accent/30 to-brand-accent/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
