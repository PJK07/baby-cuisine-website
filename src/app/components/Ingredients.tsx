import bakingProcess from '../../assets/baking-process.webp';
import { Carrot, Apple, Salad, Droplets } from "lucide-react";

const ingredientCategories = [
  {
    icon: Carrot,
    name: "Fresh Vegetables",
    items: ["Organic Carrots", "Sweet Potatoes", "Butternut Squash", "Peas"],
    color: "#FF9800",
  },
  {
    icon: Apple,
    name: "Ripe Fruits",
    items: ["Bananas", "Apples", "Pears", "Blueberries"],
    color: "#F5C542",
  },
  {
    icon: Salad,
    name: "Leafy Greens",
    items: ["Spinach", "Kale", "Broccoli", "Green Beans"],
    color: "#7CB342",
  },
  {
    icon: Droplets,
    name: "Pure Grains",
    items: ["Organic Oats", "Brown Rice", "Quinoa", "Millet"],
    color: "#C4915F",
  },
];

export function Ingredients() {
  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F5C542]/10 to-[#7CB342]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FF9800]/10 to-[#F3E5F5]/10 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-5xl lg:text-6xl font-bold text-[#3E2723] mb-6"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Real Food, Real Ingredients
          </h2>
          <p className="text-xl text-[#8D6E63] max-w-2xl mx-auto">
            We believe you should know exactly what's in your baby's food. That's
            why we use only simple, recognizable ingredients you can trust.
          </p>
        </div>

        {/* Ingredients Image */}
        <div className="mb-20 relative">
          <div>
            <img
              src={bakingProcess}
              alt="Fresh organic ingredients"
              className="w-full max-w-4xl mx-auto rounded-3xl shadow-2xl"
              width={1000}
              height={1000}
            />
          </div>
        </div>

        {/* Ingredient Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {ingredientCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className="bg-white border border-[#3E2723]/5 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-[#3E2723] mb-4">
                  {category.name}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li
                      key={item}
                      className="text-[#8D6E63] flex items-center gap-2"
                    >
                      <span className="text-[#7CB342]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Commitment Section */}
        <div className="bg-gradient-to-br from-[#F5C542] to-[#FBBF24] rounded-3xl p-12 lg:p-16 text-center">
          <div>
            <h3 className="text-4xl lg:text-5xl font-bold text-[#3E2723] mb-6">
              Our Ingredient Promise
            </h3>
            <p className="text-xl text-[#3E2723]/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              Every ingredient in our products is chosen for a reason. We never
              use fillers, artificial flavors, preservatives, or anything we
              wouldn't feed our own children. Just honest, nourishing food.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-[#3E2723] font-medium">
              <span className="bg-white/30 px-6 py-3 rounded-full">✗ No GMOs</span>
              <span className="bg-white/30 px-6 py-3 rounded-full">✗ No Preservatives</span>
              <span className="bg-white/30 px-6 py-3 rounded-full">✗ No Added Sugar</span>
              <span className="bg-white/30 px-6 py-3 rounded-full">✗ No Artificial Colors</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
