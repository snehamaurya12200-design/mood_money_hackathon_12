import React, { useState } from "react";
import { useFinance } from "@/src/context/FinanceContext";
import WarpGradient, { MOOD_MONEY_WARP_CONFIG } from "@/src/components/ui/warp-gradient";
import confetti from "canvas-confetti";

interface DayData {
  day: number;
  status: "completed" | "today" | "upcoming";
  spent?: number;
  cap: number;
  highlight?: string;
  hasCommitment?: boolean;
  commitmentTitle?: string;
}

export function ChallengeHQPage() {
  const {
    startingBudget,
    currentDay,
    totalDays,
    availableBalance,
    totalSpent,
    todayConsumed,
    dayCap,
    todayLeft,
    essentialCommitments,
    commitments,
    dailySafeToSpend,
    daysRemaining,
    setChallengeDay,
    resetAllData,
    transactions,
  } = useFinance();

  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState<string | null>(null);

  // Generate 30 days matrix
  const daysList: DayData[] = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const isCompleted = dayNum < currentDay;
    const isToday = dayNum === currentDay;
    const commitment = commitments.find((c) => c.dueDay === dayNum);

    // Approximate historic spend based on transactions or preset baseline
    let spent: number | undefined;
    if (isCompleted) {
      const dayTxs = transactions.filter((t) => t.dayNumber === dayNum && t.type === "expense");
      spent = dayTxs.reduce((s, t) => s + t.amount, 0);
      if (spent === 0 && dayNum < 12) {
        // Fallback realistic distributions
        spent = dayNum % 3 === 0 ? 310 : dayNum % 2 === 0 ? 180 : 240;
      }
    } else if (isToday) {
      spent = todayConsumed;
    }

    return {
      day: dayNum,
      status: isCompleted ? "completed" : isToday ? "today" : "upcoming",
      spent,
      cap: dayCap,
      hasCommitment: !!commitment,
      commitmentTitle: commitment ? `${commitment.title} (₹${commitment.amount})` : undefined,
    };
  });

  const selectedDayInfo = daysList.find((d) => d.day === selectedDay) || daysList[0];
  const selectedDayTxs = transactions.filter(
    (t) => t.dayNumber === selectedDay && t.type === "expense"
  );

  const achievements = [
    {
      id: "ach-1",
      title: "Week 01 Veteran",
      desc: "Successfully navigated the first 7 days with under ₹2,000 total burn.",
      unlocked: currentDay >= 7,
      icon: "military_tech",
      color: "#F6DF79",
    },
    {
      id: "ach-2",
      title: "Cushion Architect",
      desc: "Kept the ₹1,200 emergency cushion untouched throughout the challenge.",
      unlocked: true,
      icon: "shield",
      color: "#E94355",
    },
    {
      id: "ach-3",
      title: "Impulse Slayer",
      desc: "Ran 5+ calculations through the Decision Studio before checkout.",
      unlocked: true,
      icon: "psychology",
      color: "#552139",
    },
    {
      id: "ach-4",
      title: "Mid-Month Milestone",
      desc: "Cross Day 15 with over ₹5,000 remaining capital.",
      unlocked: currentDay >= 15 && availableBalance >= 5000,
      icon: "flag",
      color: "#F2C6D5",
    },
    {
      id: "ach-5",
      title: "Zero-Deficit Master",
      desc: "All scheduled bills (mobile recharge & subscriptions) settled without debt.",
      unlocked: true,
      icon: "verified",
      color: "#292225",
    },
    {
      id: "ach-6",
      title: "The 30-Day Conqueror",
      desc: "Survive all 30 days and cross the finish line with ₹0 deficit.",
      unlocked: currentDay >= 30 && availableBalance >= 0,
      icon: "emoji_events",
      color: "#E94355",
    },
  ];

  const handleDaySelect = (dayNum: number) => {
    setSelectedDay(dayNum);
  };

  const handleSimulateDayChange = (newDay: number) => {
    setChallengeDay(newDay);
    setSelectedDay(newDay);
    confetti({
      particleCount: 20,
      spread: 50,
      colors: ["#F6DF79", "#E94355"],
    });
  };

  const handleResetChallenge = () => {
    resetAllData();
    setShowResetModal(false);
    setSelectedDay(12);
    confetti({
      particleCount: 40,
      spread: 70,
      colors: ["#E94355", "#F6DF79", "#552139"],
    });
  };

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* ======================================================== */}
      {/* CHALLENGE MANIFESTO & COMMAND CENTER HERO */}
      {/* ======================================================== */}
      <div className="relative isolate overflow-hidden rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_6px_0px_#292225] p-space-lg sm:p-space-xl">
        <WarpGradient
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          colors={MOOD_MONEY_WARP_CONFIG.colors}
          pattern="bands"
          density={0.28}
          softness={0.9}
          speed={0.16}
          glossyHighlights={true}
          vignette={true}
          satinSheen={true}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#FFF9F1]/80 pointer-events-none z-[2]"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b-[1.5px] border-[#292225]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border border-[#292225]" />
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold tracking-wider">
                Official Challenge Headquarters
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#292225] font-extrabold tracking-tight">
              Survive 30 Days on ₹10,000
            </h1>
            <p className="font-body-sm text-sm text-[#5a4040]">
              The core rules, timeline matrix, achievements, and time-travel simulation engine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-xs uppercase font-bold bg-[#E94355] text-white px-3 py-1.5 rounded-full border border-[#292225] shadow-[1px_1px_0px_#292225]">
              Day {currentDay} of 30 Active
            </span>
          </div>
        </div>

        {/* 4 Core Pillars Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mt-space-md">
          <div className="p-space-md bg-white border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Challenge Ceiling
            </span>
            <p className="font-headline-lg text-xl sm:text-2xl font-extrabold text-[#292225] mt-0.5">
              ₹{startingBudget.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#5a4040]">Fixed zero-overdraft cap</p>
          </div>
          <div className="p-space-md bg-[#F6DF79]/50 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Stash Remaining
            </span>
            <p className="font-headline-lg text-xl sm:text-2xl font-extrabold text-[#292225] mt-0.5">
              ₹{availableBalance.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#5a4040]">
              {Math.round((availableBalance / startingBudget) * 100)}% of initial reserve
            </p>
          </div>
          <div className="p-space-md bg-white border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Daily Safe-To-Spend
            </span>
            <p className="font-headline-lg text-xl sm:text-2xl font-extrabold text-[#E94355] mt-0.5">
              ₹{dailySafeToSpend} / day
            </p>
            <p className="text-[10px] text-[#5a4040]">{daysRemaining} days left in cycle</p>
          </div>
          <div className="p-space-md bg-[#F2C6D5]/40 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Ring-Fenced Bills
            </span>
            <p className="font-headline-lg text-xl sm:text-2xl font-extrabold text-[#552139] mt-0.5">
              ₹{essentialCommitments.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#5a4040]">Protected from impulse drain</p>
          </div>
        </div>

        {/* Time-Travel Simulator Bar */}
        <div className="mt-space-lg p-space-md bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E94355]">schedule</span>
            <div>
              <p className="font-label-caps text-xs text-[#292225] uppercase font-bold">
                Time-Travel Challenge Simulator
              </p>
              <p className="text-xs text-[#5a4040]">
                Jump forward or back in time to observe how your daily runway recomputes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[5, 12, 15, 20, 25, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleSimulateDayChange(d)}
                className={`px-2.5 py-1 rounded-lg border font-label-caps text-xs uppercase font-bold transition-all cursor-pointer ${
                  currentDay === d
                    ? "bg-[#E94355] text-white border-[#292225] shadow-[1px_1px_0px_#292225]"
                    : "bg-white text-[#292225] border-[#292225]/40 hover:bg-[#F6DF79]"
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 30-DAY CALENDAR MATRIX & DAY INSPECTOR */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left Column: 30-Day Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md gap-2">
            <div>
              <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-[#292225]">
                30-Day Journey Matrix
              </h2>
              <p className="text-xs text-[#5a4040]">
                Click any day to inspect spending performance and scheduled events.
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] font-label-caps uppercase font-bold text-[#552139]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#F6DF79] border border-[#292225]" />
                <span>On Track</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#E94355] border border-[#292225]" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-white border border-[#292225]/30" />
                <span>Upcoming</span>
              </div>
            </div>
          </div>

          {/* 30-Day Grid (6 cols x 5 rows) */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {daysList.map((item) => {
              const isSelected = selectedDay === item.day;
              return (
                <button
                  key={item.day}
                  type="button"
                  onClick={() => handleDaySelect(item.day)}
                  className={`p-2.5 rounded-xl border-[1.5px] flex flex-col justify-between h-20 transition-all text-left relative cursor-pointer ${
                    item.status === "today"
                      ? "bg-[#E94355] text-white border-[#292225] shadow-[2px_2px_0px_#292225] scale-[1.02]"
                      : item.status === "completed"
                      ? "bg-[#FFF9F1] hover:bg-[#F6DF79]/30 text-[#292225] border-[#292225]"
                      : "bg-white hover:bg-gray-50 text-[#292225]/70 border-[#292225]/25"
                  } ${isSelected ? "ring-2 ring-[#292225] ring-offset-2" : ""}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span
                      className={`font-label-caps text-xs font-bold ${
                        item.status === "today" ? "text-white" : "text-[#292225]"
                      }`}
                    >
                      D{item.day}
                    </span>
                    {item.hasCommitment && (
                      <span
                        className={`material-symbols-outlined text-xs ${
                          item.status === "today" ? "text-[#F6DF79]" : "text-[#E94355]"
                        }`}
                        title={item.commitmentTitle}
                      >
                        receipt
                      </span>
                    )}
                  </div>
                  <div>
                    {item.status === "completed" && (
                      <p className="font-headline-sm text-xs font-extrabold text-[#552139]">
                        ₹{item.spent}
                      </p>
                    )}
                    {item.status === "today" && (
                      <p className="font-headline-sm text-xs font-extrabold text-white">
                        ₹{todayConsumed}
                      </p>
                    )}
                    {item.status === "upcoming" && (
                      <p className="font-label-caps text-[9px] text-[#5a4040]">
                        ₹{dailySafeToSpend} safe
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Inspector & Commitment Detail (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Day Inspector Card */}
          <div className="bg-[#FFF9F1] rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg">
            <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                Day {selectedDayInfo.day} Inspector
              </span>
              <span
                className={`font-label-caps text-[10px] px-2 py-0.5 rounded-full border border-[#292225] uppercase font-bold ${
                  selectedDayInfo.status === "today"
                    ? "bg-[#E94355] text-white"
                    : selectedDayInfo.status === "completed"
                    ? "bg-[#F6DF79] text-[#292225]"
                    : "bg-white text-[#552139]"
                }`}
              >
                {selectedDayInfo.status}
              </span>
            </div>

            <div className="space-y-space-md">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#5a4040]">Day Target Allowance:</span>
                <span className="font-bold text-sm text-[#292225]">₹{dayCap} / day</span>
              </div>
              {selectedDayInfo.spent !== undefined && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#5a4040]">Actual Recorded Burn:</span>
                  <span className="font-headline-sm text-base font-extrabold text-[#E94355]">
                    ₹{selectedDayInfo.spent}
                  </span>
                </div>
              )}
              {selectedDayInfo.hasCommitment && (
                <div className="p-3 bg-[#F2C6D5]/40 border border-[#292225] rounded-lg">
                  <div className="flex items-center gap-1.5 text-[#552139]">
                    <span className="material-symbols-outlined text-sm">event</span>
                    <span className="font-label-caps text-[10px] uppercase font-bold">
                      Scheduled Commitment
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[#292225] mt-1">
                    {selectedDayInfo.commitmentTitle}
                  </p>
                </div>
              )}

              {/* Transactions on this day */}
              <div className="pt-space-sm border-t-[1.5px] border-[#292225]/15">
                <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold block mb-2">
                  Recorded Expenses ({selectedDayTxs.length})
                </span>
                {selectedDayTxs.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedDayTxs.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 bg-white rounded border border-[#292225]/20 flex justify-between items-center text-xs"
                      >
                        <span className="font-medium text-[#292225]">{t.name}</span>
                        <span className="font-bold text-[#E94355]">₹{t.amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#5a4040] italic">
                    {selectedDayInfo.status === "upcoming"
                      ? "Day hasn't occurred yet."
                      : "No discrete transactions recorded on this day."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Golden Rules Box */}
          <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg">
            <h3 className="font-headline-sm font-bold text-[#292225] mb-space-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E94355]">gavel</span>
              <span>The 4 Golden Commandments</span>
            </h3>
            <ol className="space-y-2 text-xs text-[#292225]">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#E94355] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  1
                </span>
                <span>
                  <strong>₹10,000 Hard Limit:</strong> Zero credit borrowing, zero overdrafts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#F6DF79] text-[#292225] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  2
                </span>
                <span>
                  <strong>Ring-Fence Commitments:</strong> ₹850 mobile recharge &amp; subscriptions are pre-allocated.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#552139] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  3
                </span>
                <span>
                  <strong>Sanctity of the Cushion:</strong> Keep ₹1,200 emergency reserve intact.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-[#F2C6D5] text-[#292225] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  4
                </span>
                <span>
                  <strong>Smooth Cadence:</strong> Don&apos;t burn over ₹320/day without compensatory fasting.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ACHIEVEMENTS & UNLOCKABLES */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
        <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
          <div>
            <h2 className="font-headline-md text-xl sm:text-2xl font-bold text-[#292225]">
              Challenge Badges &amp; Milestones
            </h2>
            <p className="text-xs text-[#5a4040]">
              Unlock proof of survival as you conquer the 30-day timeline.
            </p>
          </div>
          <span className="font-label-caps text-xs uppercase font-bold bg-[#F6DF79] text-[#292225] px-2.5 py-1 rounded border border-[#292225]">
            4 / 6 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              onClick={() => {
                if (ach.unlocked) {
                  confetti({ particleCount: 20 });
                }
              }}
              className={`p-space-md rounded-xl border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] transition-all cursor-pointer ${
                ach.unlocked
                  ? "bg-[#FFF9F1] hover:bg-[#F6DF79]/30 hover:translate-y-[-1px]"
                  : "bg-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg border border-[#292225] flex items-center justify-center shadow-[1px_1px_0px_#292225]"
                  style={{ backgroundColor: ach.color }}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      ach.color === "#552139" || ach.color === "#292225" ? "text-white" : "text-[#292225]"
                    }`}
                  >
                    {ach.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#292225]">{ach.title}</h4>
                  <span className="font-label-caps text-[9px] uppercase font-bold text-[#552139]">
                    {ach.unlocked ? "✓ Unlocked" : "Locked"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#5a4040] leading-snug">{ach.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RESET & RESTART CHALLENGE SECTION */}
      {/* ======================================================== */}
      <div className="bg-[#FFF9F1] rounded-2xl border-[1.5px] border-[#292225] p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md border-dashed">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#E94355] text-2xl">restart_alt</span>
          <div>
            <h4 className="font-bold text-sm text-[#292225]">Want a fresh start?</h4>
            <p className="text-xs text-[#5a4040]">
              Reset ledger transactions, budget allocations, and challenge metrics back to default baseline.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="btn-3d btn-3d-burgundy px-4 py-2 text-xs font-bold text-white flex-shrink-0"
        >
          Reset Challenge Data
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFF9F1] border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] rounded-2xl shadow-[0_8px_0px_#292225] p-space-lg max-w-md w-full">
            <h3 className="font-headline-sm text-lg font-bold text-[#292225] mb-2">
              Reset 30-Day Challenge?
            </h3>
            <p className="text-sm text-[#5a4040] mb-space-md leading-relaxed">
              This will restore the challenge to Day 12 baseline with ₹6,840 available balance, reset transactions, and default budget categories.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="btn-3d btn-3d-white px-3 py-1.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetChallenge}
                className="btn-3d btn-3d-cherry px-4 py-1.5 text-xs font-bold"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChallengeHQPage;
