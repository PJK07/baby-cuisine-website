import { ArrowRight, Package, Sparkles } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-brand-primary to-brand-primary-hover relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              Special Introductory Offer
            </span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            Give Your Baby
            <br />
            <span className="text-brand-bg">The Best Start</span>
          </h2>

          <p className="text-xl lg:text-2xl text-white/95 mb-12 max-w-2xl mx-auto leading-relaxed">
            Fresh, handmade food delivered to your door. Join hundreds of
            mothers who trust us every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => {
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white text-brand-primary px-10 py-5 rounded-full text-lg font-bold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 group"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>

            <button className="bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-full text-lg font-bold border-2 border-white hover:bg-white/30 transition-all flex items-center gap-2">
              <Package className="w-5 h-5" />
              Build a Bundle
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Subscribe & Save 15%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
