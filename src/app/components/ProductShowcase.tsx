import image_166f648d12d055725e5c6999d5a071742d2a9a91 from '../../assets/166f648d12d055725e5c6999d5a071742d2a9a91.png';
import image_7e1acf7a3074b9e2b1a7bd1051d62ca99be00918 from '../../assets/7e1acf7a3074b9e2b1a7bd1051d62ca99be00918.png';

const products = [
  {
    name: "Carrot Delight",
    description: "Soft, sweet carrots—gentle on your baby's tummy",
    details: "No sugar, no additives. Just pure comfort.",
    age: "6+ months",
    color: "var(--color-brand-primary)",
  },
  {
    name: "Green Goodness",
    description: "Nutrient-rich greens for growing little ones",
    details: "Easy digestion, natural ingredients only.",
    age: "8+ months",
    color: "var(--color-brand-accent)",
  },
  {
    name: "Berry Bliss",
    description: "Sweet berries packed with natural goodness",
    details: "Handmade daily with love and care.",
    age: "10+ months",
    color: "var(--color-brand-bg)",
  },
  {
    name: "Golden Oats",
    description: "Wholesome oats for happy, healthy babies",
    details: "Soft, comforting, just like homemade.",
    age: "12+ months",
    color: "var(--color-brand-primary-hover)",
  },
];

export function ProductShowcase() {
  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold text-brand-dark mb-6">
            Handmade for <span className="text-brand-primary">Your Baby</span>
          </h2>
          <p className="text-xl text-brand-dark/80 max-w-2xl mx-auto leading-relaxed">
            Each jar is a promise—soft, fresh, and made with the same care you'd give at home.
          </p>
        </div>

        {/* Product Grid Image */}
        <div className="mb-20 relative">
          <div>
            <img
              src={image_7e1acf7a3074b9e2b1a7bd1051d62ca99be00918}
              alt="Baby Cuisine Product Range"
              className="w-full rounded-[2rem] shadow-2xl"
              width={1000}
              height={600}
            />
          </div>

          {/* Trust badge */}
          <div className="absolute -top-8 -right-8 bg-gradient-to-br from-brand-primary to-brand-primary-hover text-white px-8 py-6 rounded-[2rem] shadow-2xl">
            <div className="text-center">
              <div className="text-4xl font-bold">Fresh</div>
              <div className="text-sm font-medium">Made Daily</div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-brand-bg/40 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all"
            >
              <div
                className="w-full h-32 rounded-[1.5rem] mb-4 flex items-center justify-center shadow-inner"
                style={{ backgroundColor: product.color }}
              >
                <div className="text-6xl">🍽️</div>
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-2">
                {product.name}
              </h3>
              <p className="text-brand-dark/80 mb-2 leading-relaxed">{product.description}</p>
              <p className="text-sm text-brand-dark/70 mb-4 italic">{product.details}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-dark bg-brand-accent/20 px-4 py-2 rounded-full">
                  {product.age}
                </span>
                <button className="text-brand-primary font-semibold hover:text-brand-primary-hover transition-colors">
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Shot */}
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-brand-bg to-white rounded-[2rem] p-12 lg:p-16 shadow-xl">
            <div>
              <img
                src={image_166f648d12d055725e5c6999d5a071742d2a9a91}
                alt="Product detail"
                className="w-full rounded-[1.5rem] shadow-xl"
                width={800}
                height={800}
              />
            </div>
            <div>
              <h3 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-6 leading-tight">
                Soft, Fresh, and
                <br />
                <span className="text-brand-primary">Made for Tiny Tummies</span>
              </h3>
              <p className="text-xl text-brand-dark/80 mb-8 leading-relaxed">
                Every product is carefully prepared using simple, recognizable
                ingredients. Easy digestion. Natural comfort. No worries.
              </p>
              <ul className="space-y-4 text-brand-dark">
                <li className="flex items-start gap-3">
                  <span className="text-2xl text-brand-primary">✓</span>
                  <div>
                    <strong className="text-lg">100% Natural Ingredients</strong>
                    <p className="text-brand-dark/80">Nothing artificial, nothing processed</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl text-brand-primary">✓</span>
                  <div>
                    <strong className="text-lg">No Added Sugar</strong>
                    <p className="text-brand-dark/80">Just clean, comforting goodness</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl text-brand-primary">✓</span>
                  <div>
                    <strong className="text-lg">Safe for Babies</strong>
                    <p className="text-brand-dark/80">Gentle on delicate systems</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
