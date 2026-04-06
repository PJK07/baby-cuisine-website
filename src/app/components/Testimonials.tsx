import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Mother of two",
    text: "I finally feel good about what I'm feeding my baby. It tastes real, looks fresh, and she loves it. I can't ask for more than that.",
    rating: 5,
  },
  {
    name: "Emily R.",
    role: "First-time mom",
    text: "This is exactly what I was looking for—clean, simple, made with care. No worries, no stress. Just healthy food I can trust.",
    rating: 5,
  },
  {
    name: "Jessica T.",
    role: "Mother of three",
    text: "I've tried everything. Baby Cuisine is the only one that feels homemade. My kids can tell the difference, and so can I.",
    rating: 5,
  },
];

export function Testimonials() {
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
          >
            Loved by Parents
          </motion.h2>
          <p className="text-xl text-[#8D6E63] max-w-2xl mx-auto">
            Don't just take our word for it—hear what families are saying about
            Baby Cuisine.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all relative"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5,
                }}
                className="absolute -top-4 -left-4 w-12 h-12 bg-[#F5C542] rounded-full flex items-center justify-center shadow-lg"
              >
                <Quote className="w-6 h-6 text-[#3E2723]" />
              </motion.div>

              <div
                className="flex gap-1 mb-4"
                role="img"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                      isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
                    }
                    transition={{ delay: 0.4 + index * 0.1 + i * 0.1 }}
                    className="text-[#F5C542] text-2xl"
                    aria-hidden="true"
                  >
                    ★
                  </motion.span>
                ))}
              </div>

              <p className="text-[#3E2723] text-lg mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              <div className="border-t border-[#F5E6D3] pt-4">
                <p className="font-bold text-[#3E2723]">{testimonial.name}</p>
                <p className="text-[#8D6E63] text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-8 text-center max-w-4xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-[#3E2723]/5"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="text-6xl font-bold text-[#7CB342] mb-2"
            >
              4.9
            </motion.div>
            <p className="text-xl text-[#3E2723] font-medium">Average Rating</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-[#3E2723]/5"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="text-6xl font-bold text-[#FF9800] mb-2"
            >
              100%
            </motion.div>
            <p className="text-xl text-[#3E2723] font-medium">Healthy</p>
            <p className="text-[#8D6E63]">100%</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}