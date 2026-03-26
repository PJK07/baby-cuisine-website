import image_39978aad433211ec57a74d02e383401571a5113e from '../../assets/39978aad433211ec57a74d02e383401571a5113e.png'
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F5C542]/10 to-[#7CB342]/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[#FF9800]/10 to-[#F3E5F5]/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-5xl lg:text-6xl font-bold text-[#3E2723] mb-6"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Real Food, Real Ingredients
          </motion.h2>
          <p className="text-xl text-[#8D6E63] max-w-2xl mx-auto">
            We believe you should know exactly what's in your baby's food. That's
            why we use only simple, recognizable ingredients you can trust.
          </p>
        </motion.div>

        {/* Ingredients Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20 relative"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src={image_39978aad433211ec57a74d02e383401571a5113e}
              alt="Fresh organic ingredients"
              className="w-full max-w-4xl mx-auto rounded-3xl shadow-2xl"
            />
          </motion.div>
        </motion.div>

        {/* Ingredient Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {ingredientCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-[#FFF8E7] rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </motion.div>
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
              </motion.div>
            );
          })}
        </div>

        {/* Commitment Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-gradient-to-br from-[#F5C542] to-[#FBBF24] rounded-3xl p-12 lg:p-16 text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-4xl lg:text-5xl font-bold text-[#3E2723] mb-6">
              Our Ingredient Promise
            </h3>
            <p className="text-xl text-[#3E2723]/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              Every ingredient in our products is chosen for a reason. We never
              use fillers, artificial flavors, preservatives, or anything we
              wouldn't feed our own children. Just honest, nourishing food.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-[#3E2723] font-medium">
              <span className="bg-white/30 px-6 py-3 rounded-full">
                ✗ No GMOs
              </span>
              <span className="bg-white/30 px-6 py-3 rounded-full">
                ✗ No Preservatives
              </span>
              <span className="bg-white/30 px-6 py-3 rounded-full">
                ✗ No Added Sugar
              </span>
              <span className="bg-white/30 px-6 py-3 rounded-full">
                ✗ No Artificial Colors
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
