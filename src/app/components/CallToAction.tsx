import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Package, Sparkles } from "lucide-react";

export function CallToAction() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-24 px-6 bg-gradient-to-br from-[#7CB342] to-[#8BC34A] relative overflow-hidden"
    >
      {/* Animated background shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full mb-6 backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              Special Introductory Offer
            </span>
          </motion.div>

          <motion.h2
            className="text-5xl lg:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Give Your Baby
            <br />
            <span className="text-[#FFE5D9]">The Best Start</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl lg:text-2xl text-white/95 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Fresh, handmade food delivered to your door. Join thousands of
            mothers who trust us every day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#7CB342] px-10 py-5 rounded-full text-lg font-bold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 group"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-full text-lg font-bold border-2 border-white hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Build a Bundle
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Free Shipping Over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Subscribe & Save 15%</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}