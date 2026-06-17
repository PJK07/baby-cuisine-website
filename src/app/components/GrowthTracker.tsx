import { useState, useId } from "react";
import { Baby, Calendar, Scale, Ruler, HeartPulse, ChevronRight, Sparkles, MessageCircle } from "lucide-react";
import { calculateGrowthPercentile, type GrowthResult } from "../utils/growthCalculator";
import { WHATSAPP_NUMBER } from "../constants";

export function GrowthTracker() {
  const [sex, setSex] = useState<"boy" | "girl">("boy");
  const [ageMonths, setAgeMonths] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [lengthCm, setLengthCm] = useState<string>("");
  const [result, setResult] = useState<GrowthResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sexLabelId = useId();
  const ageInputId = useId();
  const weightInputId = useId();
  const lengthInputId = useId();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const age = parseFloat(ageMonths);
    const weight = parseFloat(weightKg);
    const length = parseFloat(lengthCm);

    if (isNaN(age) || age < 0 || age > 60) {
      setError("Please enter a valid age between 0 and 60 months.");
      return;
    }

    if (isNaN(weight) || weight < 1 || weight > 40) {
      setError("Please enter a valid weight between 1 and 40 kg.");
      return;
    }

    if (isNaN(length) || length < 40 || length > 120) {
      setError("Please enter a valid length between 40 and 120 cm.");
      return;
    }

    const calculated = calculateGrowthPercentile(sex, age, weight, length);
    setResult(calculated);

    // Scroll down to results smoothly on mobile
    setTimeout(() => {
      document.getElementById("tracker-result")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  const handleReset = () => {
    setAgeMonths("");
    setWeightKg("");
    setLengthCm("");
    setResult(null);
    setError(null);
  };

  const getWhatsAppLink = () => {
    if (!result) return "";
    const sexText = sex === "boy" ? "boy" : "girl";
    const statusText = result.status === "healthy" ? "healthy weight" : result.status;
    const baseMessage = `Hi! I just used your Baby Growth Tracker. Here are my baby's results:
- Sex: ${sexText}
- Age: ${ageMonths} months
- Weight: ${weightKg} kg
- Length: ${lengthCm} cm
- Percentile: ${result.percentile}th percentile (${statusText})

I'd love to book a consultation to discuss the best meal plans and nutrition for my baby.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMessage)}`;
  };

  return (
    <section id="bmi-calculator" className="py-24 px-6 bg-gradient-to-b from-[#FDFBF7] to-white overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#FFE5D9] text-[#a85c0a] px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Growth Tracker Resource</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-4">Baby Growth Tracker</h1>
          <p className="text-lg text-brand-dark/80 max-w-2xl mx-auto leading-relaxed">
            Monitor your baby's growth and development using the World Health Organization (WHO) Child Growth Standards.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Calculator Form */}
          <div className="md:col-span-7 bg-white border border-brand-dark/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-bg/20 rounded-bl-full pointer-events-none" />
            
            <form onSubmit={handleCalculate} className="space-y-6">
              {/* Sex Selection */}
              <div>
                <span id={sexLabelId} className="block text-sm font-semibold text-brand-dark mb-3">
                  Baby's Sex
                </span>
                <div role="radiogroup" aria-labelledby={sexLabelId} className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={sex === "boy"}
                    onClick={() => setSex("boy")}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-semibold ${
                      sex === "boy"
                        ? "border-[#C4915F] bg-[#C4915F]/10 text-brand-dark shadow-md"
                        : "border-brand-dark/10 bg-transparent text-brand-dark/70 hover:border-brand-dark/20"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sex === "boy" ? "border-[#C4915F]" : "border-brand-dark/30"}`}>
                      {sex === "boy" && <div className="w-2 h-2 rounded-full bg-[#C4915F]" />}
                    </div>
                    <span>Boy</span>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={sex === "girl"}
                    onClick={() => setSex("girl")}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-semibold ${
                      sex === "girl"
                        ? "border-[#C4915F] bg-[#C4915F]/10 text-brand-dark shadow-md"
                        : "border-brand-dark/10 bg-transparent text-brand-dark/70 hover:border-brand-dark/20"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sex === "girl" ? "border-[#C4915F]" : "border-brand-dark/30"}`}>
                      {sex === "girl" && <div className="w-2 h-2 rounded-full bg-[#C4915F]" />}
                    </div>
                    <span>Girl</span>
                  </button>
                </div>
              </div>

              {/* Age Input */}
              <div>
                <label htmlFor={ageInputId} className="flex items-center gap-2 text-sm font-semibold text-brand-dark mb-2">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  <span>Age (in months)</span>
                </label>
                <div className="relative">
                  <input
                    id={ageInputId}
                    type="number"
                    min="0"
                    max="60"
                    step="0.5"
                    required
                    placeholder="e.g. 8"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-brand-bg/10 border border-brand-dark/10 focus:outline-none focus:border-[#C4915F] focus:ring-2 focus:ring-[#C4915F]/20 text-brand-dark font-medium placeholder-brand-dark/30 transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-brand-dark/50 font-medium">
                    months
                  </span>
                </div>
                <p className="text-xs text-brand-dark/40 mt-1">Calculates weight-for-length under 24 months, and BMI-for-age from 2–5 years.</p>
              </div>

              {/* Weight Input */}
              <div>
                <label htmlFor={weightInputId} className="flex items-center gap-2 text-sm font-semibold text-brand-dark mb-2">
                  <Scale className="w-4 h-4 text-brand-primary" />
                  <span>Weight (in kg)</span>
                </label>
                <div className="relative">
                  <input
                    id={weightInputId}
                    type="number"
                    min="1"
                    max="40"
                    step="0.05"
                    required
                    placeholder="e.g. 8.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-brand-bg/10 border border-brand-dark/10 focus:outline-none focus:border-[#C4915F] focus:ring-2 focus:ring-[#C4915F]/20 text-brand-dark font-medium placeholder-brand-dark/30 transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-brand-dark/50 font-medium">
                    kg
                  </span>
                </div>
              </div>

              {/* Length Input */}
              <div>
                <label htmlFor={lengthInputId} className="flex items-center gap-2 text-sm font-semibold text-brand-dark mb-2">
                  <Ruler className="w-4 h-4 text-brand-primary" />
                  <span>Length / Height (in cm)</span>
                </label>
                <div className="relative">
                  <input
                    id={lengthInputId}
                    type="number"
                    min="40"
                    max="120"
                    step="0.1"
                    required
                    placeholder="e.g. 70"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-brand-bg/10 border border-brand-dark/10 focus:outline-none focus:border-[#C4915F] focus:ring-2 focus:ring-[#C4915F]/20 text-brand-dark font-medium placeholder-brand-dark/30 transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-brand-dark/50 font-medium">
                    cm
                  </span>
                </div>
              </div>

              {error && (
                <div role="alert" className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#C4915F] hover:bg-[#b07f50] text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer text-center"
                >
                  Calculate Growth
                </button>
                {(ageMonths || weightKg || lengthCm || result) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 border border-brand-dark/10 hover:border-brand-dark/20 text-brand-dark/70 py-4 rounded-2xl font-semibold transition-colors hover:bg-brand-bg/5"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results Display Area */}
          <div className="md:col-span-5 h-full">
            {result ? (
              <div
                id="tracker-result"
                className="bg-white border border-brand-dark/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between h-full transition-all animate-[fadeIn_0.4s_ease-out]"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-dark/5">
                    <div className="w-10 h-10 rounded-full bg-[#FFE5D9] flex items-center justify-center text-[#a85c0a]">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark">Growth Analysis</h3>
                      <p className="text-xs text-brand-dark/60">
                        {result.type === "weight-for-length" ? "Weight-for-Length (WHO 0-2 yrs)" : "BMI-for-Age (WHO 2-5 yrs)"}
                      </p>
                    </div>
                  </div>

                  {/* Percentile Big Circle */}
                  <div className="text-center my-6">
                    <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-[#C4915F]/10 border-4 border-[#C4915F] mb-4 relative shadow-inner">
                      <div className="absolute inset-2 rounded-full border border-dashed border-[#C4915F]/40" />
                      <div className="flex flex-col items-center">
                        <span className="text-4xl lg:text-5xl font-black text-brand-dark">
                          {result.percentile}
                          <span className="text-2xl font-bold">%</span>
                        </span>
                        <span className="text-xs text-brand-dark/60 font-semibold uppercase tracking-wider mt-1">Percentile</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-brand-dark px-4 mt-2 leading-relaxed">
                      {result.friendlyMessage}
                    </h4>
                  </div>

                  {/* Percentile Slider Gauge Visual */}
                  <div className="mt-8 mb-6 bg-brand-bg/20 p-4 rounded-2xl border border-brand-dark/5">
                    <div className="flex justify-between text-xs font-semibold text-brand-dark/60 mb-2">
                      <span>Underweight</span>
                      <span className="text-brand-primary font-bold">Healthy (5th - 85th)</span>
                      <span>Overweight</span>
                    </div>
                    <div className="h-4 bg-brand-dark/5 rounded-full relative overflow-hidden border border-brand-dark/5">
                      {/* Healthy range bar background indicator */}
                      <div className="absolute left-[5%] right-[15%] top-0 bottom-0 bg-[#A8D5BA]/30 border-x border-[#A8D5BA]/50" />
                      
                      {/* Marker of baby's percentile */}
                      <div
                        className="absolute w-3 h-full bg-[#a85c0a] -translate-x-1/2 transition-all duration-1000 shadow-md"
                        style={{ left: `${result.percentile}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-brand-dark/40 font-medium mt-1">
                      <span>0%</span>
                      <span>5%</span>
                      <span>50%</span>
                      <span>85%</span>
                      <span>95%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Notes & Advisory */}
                  <div className="space-y-3 mt-6">
                    <div className="flex gap-2.5 items-start p-4 bg-brand-bg/10 rounded-2xl border border-[#FFE5D9]/50">
                      <HeartPulse className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-brand-dark/70 leading-relaxed">
                        Percentiles between the <span className="font-semibold text-brand-dark">5th and 85th</span> are generally considered healthy. Please consult your pediatrician for a comprehensive evaluation of your baby's growth curve.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action CTA buttons */}
                <div className="mt-8 pt-6 border-t border-brand-dark/5 space-y-3">
                  {/* Book a Consultation */}
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 bg-[#25D366]/10 hover:bg-[#25D366]/15 rounded-2xl border border-[#25D366]/30 transition-all shadow-sm cursor-pointer"
                  >
                    <div className="text-left pr-2">
                      <p className="text-xs font-semibold text-[#128C7E] uppercase tracking-wider mb-0.5 font-bold">Personal Guidance</p>
                      <h4 className="text-sm font-bold text-brand-dark group-hover:text-[#128C7E] transition-colors">
                        Book a Nutrition Consultation
                      </h4>
                      <p className="text-[11px] text-brand-dark/60 mt-0.5">Share this growth report with us on WhatsApp</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-4 h-4 text-white fill-white" />
                    </div>
                  </a>

                  {/* Soft CTA to Meal Plans */}
                  <a
                    href="#shop"
                    className="group flex items-center justify-between p-4 bg-[#C4915F]/5 hover:bg-[#C4915F]/10 rounded-2xl border border-[#C4915F]/20 transition-all shadow-sm cursor-pointer"
                  >
                    <div className="text-left pr-2">
                      <p className="text-xs font-bold text-[#a85c0a] uppercase tracking-wider mb-0.5">Tailored Nutrition</p>
                      <h4 className="text-sm font-bold text-brand-dark group-hover:text-brand-primary transition-colors">
                        View recommended stage-based meals
                      </h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#C4915F] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-[#FDFBF7] border border-dashed border-brand-dark/15 rounded-[2.5rem] p-8 h-full flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-brand-bg/30 flex items-center justify-center text-brand-primary/80 mb-6">
                  <Baby className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">Awaiting Calculation</h3>
                <p className="text-sm text-brand-dark/60 max-w-[260px] leading-relaxed">
                  Enter your baby's age, weight, and length on the left to view the growth standard percentile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
