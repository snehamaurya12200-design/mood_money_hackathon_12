import React, { useState } from "react";
import { useFinance } from "@/src/context/FinanceContext";
import confetti from "canvas-confetti";
import WarpGradient from "@/src/components/ui/warp-gradient";

interface PersonalityArchetype {
  id: string;
  title: string;
  tagline: string;
  quote: string;
  description: string;
  strengths: string[];
  vulnerabilities: string[];
  survivalTip: string;
  avatarIcon: string;
  accentBg: string;
  badgeColor: string;
  traits: {
    impulseResistance: number;
    cushionLoyalty: number;
    treatAllocation: number;
    frugalEngineering: number;
    riskVelocity: number;
  };
}

const ARCHETYPES: Record<string, PersonalityArchetype> = {
  alchemist: {
    id: "alchemist",
    title: "The Strategic Alchemist",
    tagline: "Turns ₹10,000 into a masterclass in disciplined resourcefulness.",
    quote: "“A rupee allocated before sunset is ten rupees saved in regret.”",
    description:
      "You don't just spend; you calculate runway velocity in your head. You protect your emergency cushion like a locked vault, yet gracefully fund the campus essentials without panicking. When unexpected costs arise, you recalibrate the safe-to-spend cadence instantly.",
    strengths: [
      "Rigid commitment firewall (bills are paid 3 days early)",
      "Unflappable safe-to-spend adherence",
      "Master of delayed gratification and batch purchasing",
    ],
    vulnerabilities: [
      "May occasionally over-optimize and skip low-cost social joys",
      "Can feel unnecessary anxiety even when ₹6,000+ remains",
    ],
    survivalTip:
      "For Day 12 through Day 20: Keep your daily cap at ₹320, but budget a deliberate ₹150 social guilt-free treat once a week.",
    avatarIcon: "psychology_alt",
    accentBg: "bg-[#F6DF79]",
    badgeColor: "#552139",
    traits: {
      impulseResistance: 92,
      cushionLoyalty: 95,
      treatAllocation: 35,
      frugalEngineering: 90,
      riskVelocity: 18,
    },
  },
  softlife: {
    id: "softlife",
    title: "The Soft Life Realist",
    tagline: "Prioritizes daily joy and iced coffee, backed by strict mathematical limits.",
    quote: "“Survival is pointless if the coffee doesn't spark delight.”",
    description:
      "You refuse to live in joyless austerity. You'll happily walk to campus to save ₹80 on auto fare if it means enjoying an iced pour-over in peace. You understand the ₹10,000 limit, and you sculpt your expenses around rituals that nourish your mental health.",
    strengths: [
      "High emotional morale throughout the 30-day challenge",
      "Strategic trade-offs (cuts transport to afford nourishment)",
      "Uses the 'Can I Afford It?' simulator before any impulse spree",
    ],
    vulnerabilities: [
      "Vulnerable to spontaneous dining upgrades on Friday evenings",
      "Treats 'micro-luxuries' as essential line items",
    ],
    survivalTip:
      "Watch your daily ₹320 limit closely. Pair every treat purchase with a ₹50 transfer into your Emergency Cushion.",
    avatarIcon: "local_cafe",
    accentBg: "bg-[#F2C6D5]",
    badgeColor: "#E94355",
    traits: {
      impulseResistance: 62,
      cushionLoyalty: 70,
      treatAllocation: 88,
      frugalEngineering: 65,
      riskVelocity: 54,
    },
  },
  thrillseeker: {
    id: "thrillseeker",
    title: "The Spontaneous Thrillseeker",
    tagline: "Lives in the vibrant moment, dancing on the edge of the daily ₹320 limit.",
    quote: "“We will figure out tomorrow when tomorrow's canteen bill arrives.”",
    description:
      "You love late-night food deliveries, unexpected taxi shares, and flash sales. You're participating in the 30-day challenge for the thrill of the clutch win. While you've made it to Day 12 with balance intact, you need sharp guardrails to avoid Day 25 panic.",
    strengths: [
      "Incredible adaptability and improvisational budgeting",
      "High campus social connection",
      "Unfazed by sudden unexpected adjustments",
    ],
    vulnerabilities: [
      "Impulse friction leads to multiple micro-leaks (₹90 here, ₹120 there)",
      "High risk of draining the emergency cushion before Day 24",
    ],
    survivalTip:
      "Use the 'Can I Afford It?' simulator before EVERY non-canteen purchase above ₹150. Put a 12-hour freeze on all online carts.",
    avatarIcon: "bolt",
    accentBg: "bg-[#E94355]",
    badgeColor: "#F6DF79",
    traits: {
      impulseResistance: 40,
      cushionLoyalty: 55,
      treatAllocation: 94,
      frugalEngineering: 45,
      riskVelocity: 88,
    },
  },
  fortress: {
    id: "fortress",
    title: "The Fortress Builder",
    tagline: "Obsessed with safety buffers, emergency cushions, and unbreakable resilience.",
    quote: "“The Emergency Cushion is sacred ground. You don't step on it.”",
    description:
      "While others see ₹10,000 as money to burn over 30 days, you treat it as capital to protect. You already locked ₹1,200 away and want to reach ₹2,000 before Day 20. Your peace of mind comes from knowing that no sudden bill can break your stride.",
    strengths: [
      "Rock-solid financial safety net",
      "Zero fear of scheduled bills (mobile recharge & subscriptions are already ring-fenced)",
      "Consistent low burn rate across all days",
    ],
    vulnerabilities: [
      "Reluctance to invest in helpful study resources or comfort",
      "May feel stress even when comfortably in surplus",
    ],
    survivalTip:
      "Celebrate your discipline! Your emergency cushion is in top shape. Allow yourself to use the full daily ₹320 without guilt.",
    avatarIcon: "shield",
    accentBg: "bg-[#552139]",
    badgeColor: "#FFF9F1",
    traits: {
      impulseResistance: 96,
      cushionLoyalty: 98,
      treatAllocation: 25,
      frugalEngineering: 85,
      riskVelocity: 12,
    },
  },
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "It's 10:30 PM on Day 12. Friends invite you to late-night street rolls. You've consumed ₹90 of today's ₹320 limit. What do you do?",
    options: [
      { text: "Go, but set a hard ceiling of ₹150 so today stays under ₹240.", type: "softlife" },
      { text: "Order one roll, split a drink, and enjoy every bite without regrets.", type: "thrillseeker" },
      { text: "Politely pass or join with homemade chai; keep today's burn under ₹100.", type: "alchemist" },
      { text: "Join for the vibes, zero food order; protect the daily surplus for the jar.", type: "fortress" },
    ],
  },
  {
    id: 2,
    question: "You open your UPI app and discover ₹300 cashback from a recent merchant offer. Where does it go?",
    options: [
      { text: "Directly into the Emergency Cushion jar — lock it down immediately.", type: "fortress" },
      { text: "Recalculate remaining days and increase daily safe-to-spend by ₹15.", type: "alchemist" },
      { text: "Treat myself to that artisan matcha or high-grade coffee tomorrow.", type: "softlife" },
      { text: "Bank it for the upcoming weekend night out with campus crew.", type: "thrillseeker" },
    ],
  },
  {
    id: 3,
    question: "A limited vintage jacket you've eyed for 3 months drops 50% to ₹1,400. What is your honest move?",
    options: [
      { text: "Test it in 'Can I Afford It?' simulator. If runway days consumed > 4, skip.", type: "alchemist" },
      { text: "Instant skip. ₹1,400 is 14% of the entire 30-day survival budget!", type: "fortress" },
      { text: "See if I can split it into 3 monthly chunks or sell old sneakers first.", type: "softlife" },
      { text: "Buy it immediately. Opportunities like this don't wait for Day 30.", type: "thrillseeker" },
    ],
  },
  {
    id: 4,
    question: "How do you feel when you look at your current ₹6,840 balance on Day 12?",
    options: [
      { text: "In control. ₹3,160 spent in 12 days means ₹263/day — below our ₹320 limit.", type: "alchemist" },
      { text: "Satisfied, but looking forward to locking in another ₹500 in savings.", type: "fortress" },
      { text: "Pretty good! I haven't starved, had good coffee, and bills are covered.", type: "softlife" },
      { text: "Excited that we still have ₹6k+ left to play with in the next 18 days!", type: "thrillseeker" },
    ],
  },
];

export function MoneyPersonalityPage() {
  const { availableBalance, totalSpent, currentDay, savingsGoals, transactions } = useFinance();

  const [activeTab, setActiveTab] = useState<"quiz" | "profile">("profile");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>("softlife");
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [badgeSaved, setBadgeSaved] = useState(false);

  const activeGoal = savingsGoals[0] || { currentAmount: 1200, targetAmount: 2000 };
  const currentArchetype = ARCHETYPES[selectedArchetypeKey] || ARCHETYPES.alchemist;

  // Handle quiz option selection
  const handleSelectOption = (archetypeType: string) => {
    const updated = [...quizAnswers, archetypeType];
    setQuizAnswers(updated);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate most frequent archetype
      const counts: Record<string, number> = {};
      updated.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
      let highestKey = "alchemist";
      let maxCount = 0;
      Object.entries(counts).forEach(([key, count]) => {
        if (count > maxCount) {
          maxCount = count;
          highestKey = key;
        }
      });

      setSelectedArchetypeKey(highestKey);
      setHasCompletedQuiz(true);
      setActiveTab("profile");
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#E94355", "#F6DF79", "#552139"],
      });
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setActiveTab("quiz");
  };

  const handleShareBadge = () => {
    setBadgeSaved(true);
    confetti({
      particleCount: 30,
      spread: 60,
      colors: ["#E94355", "#F6DF79"],
    });
    setTimeout(() => setBadgeSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* Editorial Header Banner */}
      <div className="relative isolate overflow-hidden rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
        <WarpGradient
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          colors={["#552139", "#E94355", "#F2C6D5", "#FFF9F1"]}
          pattern="swirl"
          density={0.25}
          softness={0.9}
          speed={0.18}
          glossyHighlights={true}
          vignette={true}
          satinSheen={true}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#FFF9F1]/82 pointer-events-none z-[2]"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b-[1.5px] border-[#292225]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border border-[#292225]" />
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold tracking-wider">
                Psychology of Wealth • Ritual Cycle 04
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#292225] font-extrabold tracking-tight">
              Money Personality Lab
            </h1>
            <p className="font-body-sm text-sm text-[#5a4040]">
              Discover your financial survival archetype and emotional triggers across the 30-day challenge.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-white/90 p-1.5 rounded-xl border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225]">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-lg font-label-caps text-xs uppercase font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#E94355] text-white border border-[#292225] shadow-[1px_1px_0px_#292225]"
                  : "text-[#552139] hover:bg-black/5"
              }`}
            >
              Archetype Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`px-3 py-1.5 rounded-lg font-label-caps text-xs uppercase font-bold transition-all cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-[#E94355] text-white border border-[#292225] shadow-[1px_1px_0px_#292225]"
                  : "text-[#552139] hover:bg-black/5"
              }`}
            >
              Take 4-Step Diagnostic
            </button>
          </div>
        </div>

        {/* Live Data Sync Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-[#552139]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E94355] animate-ping" />
            <span className="font-medium">
              Live Behavioral Sync: ₹{totalSpent.toLocaleString()} spent across {transactions.length} entries on Day {currentDay}
            </span>
          </div>
          <div className="flex items-center gap-2 font-label-caps uppercase font-bold text-[10px]">
            <span>Current Cushion: ₹{activeGoal.currentAmount}</span>
            <span>•</span>
            <span>Remaining Stash: ₹{availableBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE QUIZ */}
      {activeTab === "quiz" && (
        <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
          <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-lg">
            <div>
              <span className="font-label-caps text-xs text-[#E94355] uppercase font-bold">
                Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-[#292225] mt-1">
                {QUIZ_QUESTIONS[currentQuestionIndex].question}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F6DF79] border-[1.5px] border-[#292225] flex items-center justify-center font-bold text-lg text-[#292225] shadow-[2px_2px_0px_#292225]">
              {currentQuestionIndex + 1}/{QUIZ_QUESTIONS.length}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-space-md">
            {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt.type)}
                className="w-full text-left p-space-lg rounded-xl border-[2px] border-[#292225] border-b-[4px] border-b-[#8e7070] shadow-[0_3px_0px_#292225] bg-[#FFF9F1] hover:bg-[#F6DF79]/30 hover:border-b-[5px] hover:translate-y-[-1px] active:translate-y-[2px] active:border-b-[2px] transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-space-md">
                  <span className="w-8 h-8 rounded-lg bg-white border-[1.5px] border-[#292225] font-bold text-sm text-[#292225] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E94355] group-hover:text-white transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <p className="font-body-md text-base text-[#292225] font-medium leading-relaxed pt-0.5">
                    {opt.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: ARCHETYPE PROFILE & RADAR */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Left Column: Archetype Selector & Hero Identity Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Archetype Quick Switcher Pills */}
            <div className="bg-white p-3 rounded-xl border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] flex flex-wrap gap-2 items-center">
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold mr-1">
                Explore Archetypes:
              </span>
              {Object.keys(ARCHETYPES).map((key) => {
                const item = ARCHETYPES[key];
                const isSelected = selectedArchetypeKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedArchetypeKey(key)}
                    className={`px-3 py-1.5 rounded-lg border font-label-caps text-xs uppercase font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#292225] text-white border-[#292225] shadow-[1.5px_1.5px_0px_#292225]"
                        : "bg-[#FFF9F1] text-[#292225] border-[#292225]/30 hover:bg-[#F6DF79]"
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>

            {/* Main Personality Ritual Card */}
            <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] shadow-[0_6px_0px_#292225] p-space-lg sm:p-space-xl relative overflow-hidden">
              {/* Corner Watermark */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-[#F6DF79] rounded-full border border-[#292225] font-label-caps text-[10px] uppercase font-bold">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Ritual 04 Verified</span>
              </div>

              {/* Title & Tagline */}
              <div className="flex items-center gap-3.5 mb-space-md">
                <div
                  className={`w-14 h-14 rounded-2xl ${currentArchetype.accentBg} border-[2px] border-[#292225] shadow-[3px_3px_0px_#292225] flex items-center justify-center text-[#292225] flex-shrink-0`}
                >
                  <span className="material-symbols-outlined text-[32px]">
                    {currentArchetype.avatarIcon}
                  </span>
                </div>
                <div>
                  <span className="font-label-caps text-xs text-[#E94355] uppercase font-bold tracking-wider">
                    Primary Psychological Blueprint
                  </span>
                  <h2 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-[#292225]">
                    {currentArchetype.title}
                  </h2>
                </div>
              </div>

              {/* Tagline & Quote */}
              <p className="font-body-md text-base font-semibold text-[#552139] mb-space-sm leading-snug">
                {currentArchetype.tagline}
              </p>

              <blockquote className="p-3.5 bg-[#FFF9F1] border-l-[4px] border-l-[#E94355] border border-[#292225]/20 rounded-r-lg font-body-sm italic text-[#292225] mb-space-lg">
                {currentArchetype.quote}
              </blockquote>

              {/* Detailed Breakdown */}
              <p className="font-body-md text-sm text-[#292225] leading-relaxed mb-space-lg">
                {currentArchetype.description}
              </p>

              {/* Strengths & Vulnerabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-md border-t-[1.5px] border-[#292225]/15">
                <div className="p-space-md bg-[#FFF9F1] border border-[#292225]/20 rounded-xl">
                  <span className="font-label-caps text-xs uppercase font-bold text-[#292225] flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[#E94355] text-base">check_circle</span>
                    <span>Core Superpowers</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#5a4040]">
                    {currentArchetype.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#E94355] font-bold">›</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-space-md bg-[#FFF9F1] border border-[#292225]/20 rounded-xl">
                  <span className="font-label-caps text-xs uppercase font-bold text-[#292225] flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[#552139] text-base">warning</span>
                    <span>Blindspots</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#5a4040]">
                    {currentArchetype.vulnerabilities.map((v, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#552139] font-bold">›</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tailored Tip */}
              <div className="mt-space-lg p-space-md bg-[#F6DF79]/40 border-[1.5px] border-[#292225] rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-[#E94355] text-xl mt-0.5">lightbulb</span>
                <div>
                  <p className="font-label-caps text-xs uppercase font-bold text-[#292225]">
                    Survive Day {currentDay} through 30 Directive
                  </p>
                  <p className="font-body-sm text-xs text-[#292225] mt-0.5 leading-relaxed">
                    {currentArchetype.survivalTip}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm pt-space-md border-t-[1.5px] border-[#292225]/15">
                <button
                  type="button"
                  onClick={handleRetakeQuiz}
                  className="btn-3d btn-3d-white px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Retake Diagnostic</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareBadge}
                  className="btn-3d btn-3d-cherry px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                  <span>{badgeSaved ? "✨ Ritual Saved!" : "Save & Export Badge"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Trait Spectrum & Live Behavioral Metrics (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Trait Spectrum Bars */}
            <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
              <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E94355]">tune</span>
                  <h3 className="font-headline-sm font-bold text-[#292225]">
                    Psychological Trait Spectrum
                  </h3>
                </div>
                <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
                  Scale 0-100
                </span>
              </div>

              <div className="space-y-space-md">
                {/* Trait 1: Impulse Resistance */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-label-caps text-xs text-[#292225] font-bold">
                      Impulse Friction Resistance
                    </span>
                    <span className="font-headline-sm text-xs font-extrabold text-[#E94355]">
                      {currentArchetype.traits.impulseResistance}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f8eaee] rounded-full border border-[#292225] overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-[#E94355] rounded-full transition-all duration-700"
                      style={{ width: `${currentArchetype.traits.impulseResistance}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#5a4040] mt-0.5">
                    Ability to pause before checkout and run decision simulations.
                  </p>
                </div>

                {/* Trait 2: Cushion Loyalty */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-label-caps text-xs text-[#292225] font-bold">
                      Emergency Cushion Sanctity
                    </span>
                    <span className="font-headline-sm text-xs font-extrabold text-[#552139]">
                      {currentArchetype.traits.cushionLoyalty}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f8eaee] rounded-full border border-[#292225] overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-[#552139] rounded-full transition-all duration-700"
                      style={{ width: `${currentArchetype.traits.cushionLoyalty}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#5a4040] mt-0.5">
                    Reluctance to dip into the ₹1,200 emergency reserve for trivial wants.
                  </p>
                </div>

                {/* Trait 3: Treat Allocation */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-label-caps text-xs text-[#292225] font-bold">
                      Aesthetic &amp; Ritual Treat Appetite
                    </span>
                    <span className="font-headline-sm text-xs font-extrabold text-[#292225]">
                      {currentArchetype.traits.treatAllocation}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f8eaee] rounded-full border border-[#292225] overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-[#F6DF79] rounded-full transition-all duration-700"
                      style={{ width: `${currentArchetype.traits.treatAllocation}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#5a4040] mt-0.5">
                    Propensity to trade off transit or canteen staples for elevated experiences.
                  </p>
                </div>

                {/* Trait 4: Frugal Engineering */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-label-caps text-xs text-[#292225] font-bold">
                      Frugal Engineering
                    </span>
                    <span className="font-headline-sm text-xs font-extrabold text-[#E94355]">
                      {currentArchetype.traits.frugalEngineering}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f8eaee] rounded-full border border-[#292225] overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-[#E94355] rounded-full transition-all duration-700"
                      style={{ width: `${currentArchetype.traits.frugalEngineering}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#5a4040] mt-0.5">
                    Skill in meal prep, coupon codes, and campus metro smart card optimization.
                  </p>
                </div>

                {/* Trait 5: Risk Velocity */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-label-caps text-xs text-[#292225] font-bold">
                      Risk Velocity
                    </span>
                    <span className="font-headline-sm text-xs font-extrabold text-[#552139]">
                      {currentArchetype.traits.riskVelocity}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#f8eaee] rounded-full border border-[#292225] overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-[#884b65] rounded-full transition-all duration-700"
                      style={{ width: `${currentArchetype.traits.riskVelocity}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#5a4040] mt-0.5">
                    Likelihood of pushing close to the daily ₹320 limit on social weekends.
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Ritual Survival Advice Card */}
            <div className="bg-[#FFF9F1] rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg">
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[#E94355]">flag</span>
                <span>The 30-Day Golden Axiom</span>
              </span>
              <p className="font-headline-sm text-base font-bold text-[#292225] mb-2">
                “Discipline without joy leads to burnout. Joy without math leads to deficit.”
              </p>
              <p className="text-xs text-[#5a4040] leading-relaxed">
                By acknowledging your {currentArchetype.title} nature, you no longer fight your instincts. You engineer your environment so that ₹10,000 lasts all 30 days comfortably.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoneyPersonalityPage;
