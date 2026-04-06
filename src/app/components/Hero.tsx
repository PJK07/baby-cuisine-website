import heroImage from '../../assets/1190b4e7cdfa9a4c1a292a01cff92e07a48e8ab9_optimized_1000.png'
import { motion } from "motion/react";
import { Heart, Leaf, Sparkles } from "lucide-react";
import logoImage from "../../assets/56793963f4406674327e30a2587aa6beac1f4afa.png";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white px-6 py-20 pt-32">
      {/* Animated background shapes - softer and warmer */}
      <motion.div
        className="absolute top-20 left-10 w-40 h-40 bg-[#FFB88C] rounded-full opacity-15 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 40, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-48 h-48 bg-[#A8D5BA] rounded-full opacity-15 blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -50, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content - More emotional and direct */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 inline-block"
            >
              <img
                src={logoImage}
                alt="The Baby Cuisine logo"
                className="w-56 h-auto mx-auto lg:mx-0 drop-shadow-sm"
                decoding="async"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl lg:text-7xl font-bold text-[#3E2723] mb-6 leading-[1.1]"
            >
              Made with Love,
              <br />
              <span className="text-[#C4915F]">for Their First Bites</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl lg:text-2xl text-[#5D4037] mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Pure, soft, and made for tiny tummies. Because your baby deserves
              better than processed food.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#C4915F] text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-[#A67C52] transition-all shadow-xl hover:shadow-2xl"
              >
                Order Fresh Today
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white text-[#3E2723] px-10 py-5 rounded-full text-lg font-semibold hover:bg-[#FAFAFA] transition-all shadow-lg border border-[#C4915F]/20"
              >
                Explore Menu
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-wrap gap-8 justify-center lg:justify-start text-[#5D4037]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFE5D9] rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-[#C4915F] text-[#C4915F]" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#3E2723]">Handmade</div>
                  <div className="text-sm text-[#8D6E63]">with care</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-[#7CB342]" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#3E2723]">Natural Ingredients</div>
                  <div className="text-sm text-[#8D6E63]">very high quality</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFF9C4] rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#F5C542]" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[#3E2723]">Freshly Made</div>
                  <div className="text-sm text-[#8D6E63]">daily</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right content - Mouthwatering product showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
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
              className="relative z-10"
            >
              <img
                src={heroImage}
                alt="Assortment of Baby Cuisine fresh handmade baby food products"
                className="rounded-[2rem] shadow-2xl w-full max-w-lg mx-auto"
                fetchPriority="high"
                decoding="async"
                width={512}
                height={512}
              />
            </motion.div>

            {/* Trust badges floating around the image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -top-6 -right-6 bg-white text-[#3E2723] px-6 py-4 rounded-3xl shadow-2xl z-20"
              whileHover={{ scale: 1.1, rotate: 3 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-[#7CB342]">100%</div>
                <div className="text-sm font-medium">Natural</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white text-[#3E2723] px-6 py-4 rounded-3xl shadow-2xl z-20"
              whileHover={{ scale: 1.1, rotate: -3 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF9800]">0</div>
                <div className="text-sm font-medium">Salt and Sugar</div>
              </div>
            </motion.div>

            {/* Soft decorative elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-br from-[#FFB88C]/30 to-[#F5C542]/30 rounded-full blur-2xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-16 -left-16 w-40 h-40 bg-gradient-to-br from-[#A8D5BA]/30 to-[#7CB342]/30 rounded-full blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}