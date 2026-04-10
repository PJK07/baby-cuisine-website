import brandStoryImage from '../../assets/baking-process.webp';
import { Heart, Users, Leaf, Award } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Every batch is prepared with the same care and love that we give to our own children.",
    color: "var(--color-brand-primary)",
  },
  {
    icon: Leaf,
    title: "Pure & Natural",
    description:
      "Our ingredients are natural and fresh. Some of them are certified organic",
    color: "var(--color-brand-accent)",
  },
  {
    icon: Users,
    title: "Parent Trusted",
    description:
      "Hundreds of parents trust Baby Cuisine to nourish their little ones.",
    color: "var(--color-brand-primary-hover)",
  },
  {
    icon: Award,
    title: "Expert Approved",
    description:
      "Developed with a pediatric nutritionist and a pediatrician to ensure optimal growth and development.",
    color: "var(--color-brand-dark)",
  },
];

export function BrandStory() {
  return (
    <section id="our-story" className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-5xl lg:text-6xl font-bold text-brand-dark mb-6">
              Our Story
            </h2>
            <div className="space-y-6 text-lg text-brand-dark/80 leading-relaxed">
              <p>
                Babycuisine was created to provide busy parents with the best baby food, having clean ingredients,made in toxin free pots, filled in glass jars... for their proper development.
              </p>
              <p className="text-xl font-semibold text-brand-primary italic">
                Because your baby deserves the best food.
              </p>
            </div>

          </div>

          <div className="relative">
            <div>
              <img
                src={brandStoryImage}
                alt="Handmade with love in our kitchen — Baby Cuisine founder preparing fresh baby food"
                className="w-full rounded-[2rem] shadow-2xl"
                loading="lazy"
                decoding="async"
                width={600}
                height={600}
              />
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full border-4 border-brand-primary opacity-50" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full border-4 border-brand-accent opacity-50" />
          </div>
        </div>

        {/* Values Grid */}
        <div id="brand-values" className="text-center mb-12">
          <h3 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-4">
            What We Stand For
          </h3>
          <p className="text-xl text-brand-dark/70 max-w-2xl mx-auto">
            Our values guide everything we do, from sourcing ingredients to
            supporting families.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all text-center"
              >
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                  style={{ backgroundColor: value.color }}
                >
                  <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                <h4 className="text-2xl font-bold text-brand-dark mb-4">
                  {value.title}
                </h4>
                <p className="text-brand-dark/70 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
