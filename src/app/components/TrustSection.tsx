import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Shield, HeartPulse, Sprout, Baby } from "lucide-react";

const trustPoints = [
  {
    icon: Sprout,
    title: "100% Natural",
    description: "No preservatives, no artificial ingredients. Just real food.",
  },
  {
    icon: Shield,
    title: "No sugar",
    description: "Sweetened with Fruit. Naturally sweet, nothing added.",
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="why-us" className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-5xl lg:text-6xl font-bold text-[#3E2723] mb-6"
          >
            Why <span className="text-[#C4915F]">Baby Cuisine</span>?
          </motion.h2>
          <p className="text-xl text-[#5D4037] max-w-2xl mx-auto leading-relaxed">
            We know you're careful about what your baby eats. That's why we make
            it simple, safe, and stress-free.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FFE5D9] to-[#F5E6D3] rounded-full flex items-center justify-center shadow-inner"
                >
                  <Icon className="w-10 h-10 text-[#C4915F]" strokeWidth={2} />
                </motion.div>
                <h3 className="text-2xl font-bold text-[#3E2723] mb-3">
                  {point.title}
                </h3>
                <p className="text-[#5D4037] leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance Statement */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-[2rem] p-12 lg:p-16 shadow-xl text-center max-w-4xl mx-auto"
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
            <h3 className="text-3xl lg:text-4xl font-bold text-[#3E2723] mb-6 leading-tight">
              You don't need to worry.
              <br />
              <span className="text-[#C4915F]">We've got you covered.</span>
            </h3>
            <p className="text-xl text-[#5D4037] leading-relaxed mb-8">
              Every spoon is nutrient dense and well-balanced for your baby's development
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-[#E8F5E9] text-[#7CB342] px-6 py-3 rounded-full font-semibold">
                ✓ Certified Organic
              </div>
              <div className="bg-[#FFE5D9] text-[#C4915F] px-6 py-3 rounded-full font-semibold">
                ✓ Pediatrician Approved
              </div>
              <div className="bg-[#FFF9C4] text-[#F5C542] px-6 py-3 rounded-full font-semibold">
                ✓ Allergen Tested
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Mother's Reassurance Quote */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-2xl lg:text-3xl text-[#3E2723] italic font-medium max-w-3xl mx-auto leading-relaxed">
            "This is exactly what my child deserves."
          </p>
          <p className="text-lg text-[#8D6E63] mt-4">— Every mother who chooses Baby Cuisine</p>
        </motion.div>
      </div>
    </section>
  );
}
