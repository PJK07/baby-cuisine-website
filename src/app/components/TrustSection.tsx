import { Shield, HeartPulse, Baby, Fish } from "lucide-react";

const trustPoints = [
  {
    icon: Fish,
    title: "Our Meat and Fish",
    description: "Wild Pollock fish, organic chicken, and fresh meat",
  },
  {
    icon: Shield,
    title: "No sugar",
    description: "Sweetened with fruits. Naturally sweet, nothing added.",
  },
  {
    icon: HeartPulse,
    title: "Cooked with AMC pots",
    description: "Cooked at very low temperature to preserve vitamins and nutrients.",
  },
  {
    icon: Baby,
    title: "Baby-Friendly",
    description: "Gentle textures, safe ingredients, easy digestion.",
  },
];

export function TrustSection() {
  return (
    <section id="why-us" className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-dark mb-6 text-balance">
            Why <span className="text-brand-primary">Baby Cuisine</span>?
          </h2>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-brand-primary/10 rounded-full flex items-center justify-center shadow-inner">
                  <Icon className="w-10 h-10 text-brand-primary-dark" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-3">
                  {point.title}
                </h3>
                <p className="text-brand-dark/80 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reassurance Statement */}
        <div className="bg-white rounded-[2rem] p-12 lg:p-16 shadow-xl text-center max-w-4xl mx-auto">
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold text-brand-dark mb-6 leading-tight">
              You don't need to worry.
              <br />
              <span className="text-brand-primary">We've got you covered.</span>
            </h3>
            <p className="text-xl text-brand-dark/80 leading-relaxed mb-8">
              Every spoon is nutrient dense and well-balanced for your baby's development
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-brand-accent/20 text-brand-accent-dark px-6 py-3 rounded-full font-semibold">
                ✓ Natural Ingredients
              </div>
              <div className="bg-brand-primary/10 text-brand-primary-dark px-6 py-3 rounded-full font-semibold">
                ✓ Developed with a Pediatric Nutritionist
              </div>
            </div>
          </div>
        </div>

        {/* Mother's Reassurance Quote */}
        <div className="mt-16 text-center">
          <p className="text-2xl lg:text-3xl text-brand-dark italic font-medium max-w-3xl mx-auto leading-relaxed">
            "This is exactly what my child deserves."
          </p>
          <p className="text-lg text-brand-dark/70 mt-4">— Every mother who chooses Baby Cuisine</p>
        </div>
      </div>
    </section>
  );
}
