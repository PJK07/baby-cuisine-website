import image_166f648d12d055725e5c6999d5a071742d2a9a91 from '../../assets/166f648d12d055725e5c6999d5a071742d2a9a91.png'
import image_7e1acf7a3074b9e2b1a7bd1051d62ca99be00918 from '../../assets/7e1acf7a3074b9e2b1a7bd1051d62ca99be00918.png'
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import productGrid from "../../assets/c570371a6af688349f61018713c87c45ef0657eb.png";
import productDetail from "../../assets/771ec26a8c4cf431f03fcbe33854bc86d82b44b8.png";

const products = [
  {
    name: "Carrot Delight",
    description: "Soft, sweet carrots—gentle on your baby's tummy",
    details: "No sugar, no additives. Just pure comfort.",
    age: "6+ months",
    color: "#FFB88C",
  },
  {
    name: "Green Goodness",
    description: "Nutrient-rich greens for growing little ones",
    details: "Easy digestion, natural ingredients only.",
    age: "8+ months",
    color: "#A8D5BA",
  },
  {
    name: "Berry Bliss",
    description: "Sweet berries packed with natural goodness",
    details: "Handmade daily with love and care.",
    age: "10+ months",
    color: "#E8D5E8",
  },
  {
    name: "Golden Oats",
    description: "Wholesome oats for happy, healthy babies",
    details: "Soft, comforting, just like homemade.",
    age: "12+ months",
    color: "#F5E6C8",
  },
];

export function ProductShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-5xl lg:text-6xl font-bold text-[#3E2723] mb-6"
          >Handmade for <span className="text-[#C4915F]">Your Baby</span></motion.h2>
          <p className="text-xl text-[#5D4037] max-w-2xl mx-auto leading-relaxed">Each jar is a promise—soft, fresh, and made with the same care you'd give at home.</p>
        </motion.div>

        {/* Product Grid Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20 relative"
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src={image_7e1acf7a3074b9e2b1a7bd1051d62ca99be00918}
              alt="Baby Cuisine Product Range"
              className="w-full rounded-[2rem] shadow-2xl"
            />
          </motion.div>
          
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute -top-8 -right-8 bg-gradient-to-br from-[#7CB342] to-[#A8D5BA] text-white px-8 py-6 rounded-[2rem] shadow-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold">Fresh</div>
              <div className="text-sm font-medium">Made Daily</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Product Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all"
            >
              <div
                className="w-full h-32 rounded-[1.5rem] mb-4 flex items-center justify-center shadow-inner"
                style={{ backgroundColor: product.color }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-6xl"
                >
                  🍽️
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-[#3E2723] mb-2">
                {product.name}
              </h3>
              <p className="text-[#5D4037] mb-2 leading-relaxed">{product.description}</p>
              <p className="text-sm text-[#8D6E63] mb-4 italic">{product.details}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#7CB342] bg-[#E8F5E9] px-4 py-2 rounded-full">
                  {product.age}
                </span>
                <button className="text-[#C4915F] font-semibold hover:text-[#A67C52] transition-colors">
                  View →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Shot - emphasizing texture and quality */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-[#FFE5D9] to-[#FFEFD5] rounded-[2rem] p-12 lg:p-16 shadow-xl">
            <motion.div
              animate={{
                rotate: [0, 1, 0, -1, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={image_166f648d12d055725e5c6999d5a071742d2a9a91}
                alt="Product detail"
                className="w-full rounded-[1.5rem] shadow-xl"
              />
            </motion.div>
            <div>
              <h3 className="text-4xl lg:text-5xl font-bold text-[#3E2723] mb-6 leading-tight">
                Soft, Fresh, and
                <br />
                <span className="text-[#C4915F]">Made for Tiny Tummies</span>
              </h3>
              <p className="text-xl text-[#5D4037] mb-8 leading-relaxed">
                Every product is carefully prepared using simple, recognizable
                ingredients. Easy digestion. Natural comfort. No worries.
              </p>
              <ul className="space-y-4 text-[#3E2723]">
                <li className="flex items-start gap-3">
                  <span className="text-2xl text-[#7CB342]">✓</span>
                  <div>
                    <strong className="text-lg">100% Natural Ingredients</strong>
                    <p className="text-[#5D4037]">Nothing artificial, nothing processed</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl text-[#7CB342]">✓</span>
                  <div>
                    <strong className="text-lg">No Added Sugar</strong>
                    <p className="text-[#5D4037]">Just clean, comforting goodness</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl text-[#7CB342]">✓</span>
                  <div>
                    <strong className="text-lg">Safe for Babies</strong>
                    <p className="text-[#5D4037]">Gentle on delicate systems</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}