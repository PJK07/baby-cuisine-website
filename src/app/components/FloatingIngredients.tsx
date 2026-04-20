const ingredients = [
  { emoji: "🥕", x: "5%",  duration: 18, delay: 0,   size: "text-4xl" },
  { emoji: "🍎", x: "18%", duration: 22, delay: 4,   size: "text-5xl" },
  { emoji: "🥑", x: "78%", duration: 20, delay: 2,   size: "text-4xl" },
  { emoji: "🫐", x: "88%", duration: 16, delay: 6,   size: "text-3xl" },
  { emoji: "🥦", x: "12%", duration: 24, delay: 8,   size: "text-3xl" },
  { emoji: "🍌", x: "82%", duration: 19, delay: 3,   size: "text-5xl" },
];

export function FloatingIngredients() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(110vh) rotate(0deg);   opacity: 0; }
          5%   { opacity: 0.12; }
          95%  { opacity: 0.12; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {ingredients.map((ingredient, index) => (
        <span
          key={index}
          className={`absolute ${ingredient.size} select-none`}
          style={{
            left: ingredient.x,
            bottom: "-10%",
            animation: `floatUp ${ingredient.duration}s linear ${ingredient.delay}s infinite`,
          }}
        >
          {ingredient.emoji}
        </span>
      ))}
    </div>
  );
}
