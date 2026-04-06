import brandStoryImage from '../../assets/2a0c3c2dac21df3f12348fcc90ecf3fe5fd9e8d8_3_optimized_1000.png'
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Heart, Users, Leaf, Award } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Every batch is prepared with the same care and attention we'd give our own children.",
    color: "#FF9800",
  },
  {
    icon: Leaf,
    title: "Pure & Natural",
    description:
      "Our ingredients are natural and fresh. Some of them are certified organic",
    color: "#7CB342",
  },
  {
    icon: Users,
    title: "Parent Trusted",
    description:
      "Thousands of parents trust us to nourish their little ones every single day.",
    color: "#F5C542",
  },
  {
    icon: Award,
    title: "Expert Approved",
    description:
      "Developed with pediatric nutritionists to ensure optimal growth and development.",
    color: "#E8D5E8",
  },
];

export function BrandStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="our-story" className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-5xl lg:text-6xl font-bold text-[#3E2723] mb-6"
            >
              Why We Started
            </motion.h2>
            <div className="space-y-6 text-lg text-[#5D4037] leading-relaxed">
              <p>
                As parents, we couldn't find baby food that felt <em>real</em>.
                Everything was either mass-produced or too complicated.
              </p>
              <p>
                So we started making our own—simple recipes, fresh ingredients,
                and the same love we'd put into any meal for our children.
              </p>
              <p>
                Baby Cuisine isn't a factory. It's a kitchen. Every jar is
                handmade, every ingredient is chosen with care, and every bite
                is made for the most important people in your life.
              </p>
              <p className="text-xl font-semibold text-[#C4915F] italic">
                Because your baby deserves food that's made with love, not a production line.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-[#C4915F] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-[#A67C52] transition-colors"
            >
              Meet Our Team
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={brandStoryImage}
                alt="Handmade with love in our kitchen — Baby Cuisine founder preparing fresh baby food"
                className="w-full rounded-[2rem] shadow-2xl"
                loading="lazy"
                decoding="async"
                width={600}
                height={600}
              />
            </motion.div>
            {/* Decorative circles */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-10 -left-10 w-32 h-32 rounded-full border-4 border-[#F5C542] opacity-50"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full border-4 border-[#7CB342] opacity-50"
            />
          </motion.div>
        </div>

        {/* Values Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h3 className="text-4xl lg:text-5xl font-bold text-[#3E2723] mb-4">
            What We Stand For
          </h3>
          <p className="text-xl text-[#8D6E63] max-w-2xl mx-auto">
            Our values guide everything we do, from sourcing ingredients to
            supporting families.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                  style={{ backgroundColor: value.color }}
                >
                  <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                </motion.div>
                <h4 className="text-2xl font-bold text-[#3E2723] mb-4">
                  {value.title}
                </h4>
                <p className="text-[#8D6E63] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}