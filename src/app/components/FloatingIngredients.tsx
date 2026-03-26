import { motion } from "motion/react";

const ingredients = [
  { emoji: "🥕", x: "10%", delay: 0 },
  { emoji: "🍎", x: "20%", delay: 1 },
  { emoji: "🥑", x: "80%", delay: 2 },
  { emoji: "🫐", x: "90%", delay: 3 },
  { emoji: "🥦", x: "15%", delay: 1.5 },
  { emoji: "🍌", x: "85%", delay: 2.5 },
];

export function FloatingIngredients() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ingredients.map((ingredient, index) => (
        <motion.div
          key={index}
          className="absolute text-6xl opacity-10"
          style={{
            left: ingredient.x,
            top: "-10%",
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 15 + index * 2,
            repeat: Infinity,
            delay: ingredient.delay,
            ease: "linear",
          }}
        >
          {ingredient.emoji}
        </motion.div>
      ))}
    </div>
  );
}
