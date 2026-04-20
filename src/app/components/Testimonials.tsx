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
  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold text-brand-dark mb-6">
            Loved by Parents
          </h2>
          <p className="text-xl text-brand-dark/70 max-w-2xl mx-auto">
            Don't just take our word for it—hear what families are saying about
            Baby Cuisine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all relative"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>

              <div
                className="flex gap-1 mb-4"
                role="img"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span
                    key={i}
                    className="text-brand-primary text-2xl"
                    aria-hidden="true"
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-brand-dark/90 text-lg mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              <div className="border-t border-brand-primary/20 pt-4">
                <p className="font-bold text-brand-dark">{testimonial.name}</p>
                <p className="text-brand-dark/70 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-8 text-center max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-brand-dark/5">
            <div className="text-6xl font-bold text-brand-primary mb-2">
              4.9
            </div>
            <p className="text-xl text-brand-dark font-medium">Average Rating</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-brand-dark/5">
            <div className="text-6xl font-bold text-brand-primary mb-2">
              100%
            </div>
            <p className="text-xl text-brand-dark font-medium">Natural Ingredients</p>
            <p className="text-brand-dark/70">No additives, ever</p>
          </div>
        </div>
      </div>
    </section>
  );
}
