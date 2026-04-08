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
        <div
          key={index}
          className="absolute text-6xl opacity-10"
          style={{
            left: ingredient.x,
            top: "-10%",
          }}
        >
          {ingredient.emoji}
        </div>
      ))}
    </div>
  );
}
