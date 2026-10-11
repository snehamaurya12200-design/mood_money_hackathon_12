import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SpendingForecastProps {
  currentDay: number;
  totalDays: number;
  spentSoFar: number;
  initialBudget?: number;
  essentialCommitments?: number;
  className?: string;
}

export type ScenarioType = "baseline" | "frugal" | "splurge";

export function SpendingForecast({
  currentDay = 12,
  totalDays = 30,
  spentSoFar = 3160,
  initialBudget = 10000,
  essentialCommitments = 850,
  className = "",
}: SpendingForecastProps) {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("baseline");
  const remainingDays = Math.max(1, totalDays - currentDay);
  const actualDailyPace = Math.round(spentSoFar / Math.max(1, currentDay));

  // Scenario Math
  const frugalPace = Math.round(actualDailyPace * 0.75);
  // Risk scenario assumes a 60% acceleration over current burn pace (or at least ₹420 if pace is low)
  const splurgePace = Math.max(420, Math.round(actualDailyPace * 1.6));

  const scenarios = {
    baseline: {
      id: "baseline",
      name: "Current Trajectory",
      subline: `Maintains your observed ₹${actualDailyPace}/day baseline`,
      dailyPace: actualDailyPace,
      projectedRemaining: actualDailyPace * remainingDays,
      totalProjectedSpend: spentSoFar + actualDailyPace * remainingDays + essentialCommitments,
      badge: "Disciplined Pace",
      badgeColor: "bg-[#F6DF79] text-[#292225]",
      assumption:
        `Assumes daily spending remains at your current observed ₹${actualDailyPace}/day pace and scheduled bills (₹${essentialCommitments}) execute on time.`,
    },
    frugal: {
      id: "frugal",
      name: "Frugal Sprint",
      subline: `Cut discretionary spend by 25% (₹${frugalPace}/day)`,
      dailyPace: frugalPace,
      projectedRemaining: frugalPace * remainingDays,
      totalProjectedSpend:
        spentSoFar + frugalPace * remainingDays + essentialCommitments,
      badge: "Max Savings 🚀",
      badgeColor: "bg-[#F2C6D5] text-[#552139]",
      assumption:
        `Assumes a disciplined 25% reduction in discretionary expenses down to ₹${frugalPace}/day, locking in maximum surplus for your emergency cushion.`,
    },
    splurge: {
      id: "splurge",
      name: "Weekend Splurge Risk",
      subline: `Impulsive additions push daily spend to ₹${splurgePace}/day`,
      dailyPace: splurgePace,
      projectedRemaining: splurgePace * remainingDays,
      totalProjectedSpend: spentSoFar + splurgePace * remainingDays + essentialCommitments,
      badge: "Deficit Hazard ⚠️",
      badgeColor: "bg-[#E94355] text-white",
      assumption:
        `Stress-tests unexpected weekend social rituals and dining out (accelerated to ~₹${splurgePace}/day) without adjusting safe-to-spend cadence.`,
    },
  };

  const currentSc = scenarios[activeScenario];
  const projectedEndingBalance = initialBudget - currentSc.totalProjectedSpend;
  const isSurplus = projectedEndingBalance >= 0;

  // Calculate day of deficit if applicable
  const deficitDay = !isSurplus && currentSc.dailyPace > 0
    ? Math.min(
        totalDays,
        Math.max(
          currentDay,
          currentDay + Math.floor(Math.max(0, initialBudget - spentSoFar - essentialCommitments) / currentSc.dailyPace)
        )
      )
    : null;

  return (
    <div
      className={`bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225,0_10px_20px_rgba(41,34,37,0.08)] p-space-md sm:p-space-lg select-none ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E94355] text-xl">query_stats</span>
            <h3 className="font-headline-md text-headline-md font-bold text-[#292225]">
              Dynamic Spending Forecast &amp; Scenarios
            </h3>
          </div>
          <p className="font-body-sm text-xs sm:text-sm text-[#5a4040]">
            Transparent 30-day projection based on actual velocity, remaining days, and planned commitments.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="inline-flex p-1 bg-[#FFF9F1] rounded-lg border-[1.5px] border-[#292225] shadow-inner">
          {(["baseline", "frugal", "splurge"] as ScenarioType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveScenario(type)}
              className={`px-2.5 py-1 text-xs font-label-caps font-bold uppercase rounded transition-all cursor-pointer ${
                activeScenario === type
                  ? "bg-[#292225] text-white shadow-[1px_1px_0px_#292225]"
                  : "text-[#552139] hover:bg-black/5"
              }`}
            >
              {type === "baseline" ? "Baseline" : type === "frugal" ? "Frugal" : "Risk"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Forecast Matrix with Animated Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScenario}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-space-md"
        >
          {/* Top Scenario Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm font-bold text-[#292225]">
                  {currentSc.name}
                </span>
                <span
                  className={`font-label-caps text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border border-[#292225] ${currentSc.badgeColor}`}
                >
                  {currentSc.badge}
                </span>
              </div>
              <p className="font-body-sm text-xs text-[#5a4040] mt-0.5">
                {currentSc.subline}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
                Projected Day 30 Balance
              </span>
              <p
                className={`font-headline-lg font-extrabold tracking-tight ${
                  isSurplus ? "text-[#292225]" : "text-[#E94355]"
                }`}
              >
                {isSurplus ? `+ ₹${projectedEndingBalance.toLocaleString()}` : `- ₹${Math.abs(projectedEndingBalance).toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* 4-Stat Mathematical Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-2.5 bg-white rounded-xl border-[1.5px] border-[#292225] shadow-sm">
            <div className="p-1">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                Observed Pace
              </span>
              <p className="font-bold text-sm text-[#292225]">
                ₹{currentSc.dailyPace} / day
              </p>
            </div>
            <div className="p-1 border-l border-[#292225]/15">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                {remainingDays}-Day Runway Burn
              </span>
              <p className="font-bold text-sm text-[#552139]">
                ₹{currentSc.projectedRemaining.toLocaleString()}
              </p>
            </div>
            <div className="p-1 border-t sm:border-t-0 sm:border-l border-[#292225]/15">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                Pre-Allocated Bills
              </span>
              <p className="font-bold text-sm text-[#292225]">
                ₹{essentialCommitments.toLocaleString()}
              </p>
            </div>
            <div className="p-1 border-t sm:border-t-0 sm:border-l border-[#292225]/15">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                Forecast Outcome
              </span>
              <p
                className={`font-bold text-sm ${
                  isSurplus ? "text-[#552139]" : "text-[#E94355]"
                }`}
              >
                {isSurplus ? "Cushion Intact" : deficitDay ? `Deficit on Day ${deficitDay}` : "Deficit Warning"}
              </p>
            </div>
          </div>

          {/* Budget Utilization Visual Bar */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-label-caps font-bold">
              <span className="text-[#552139]">
                Projected Total Spend: ₹{currentSc.totalProjectedSpend.toLocaleString()} / ₹{initialBudget.toLocaleString()}
              </span>
              <span className={isSurplus ? "text-[#552139]" : "text-[#E94355]"}>
                {Math.round((currentSc.totalProjectedSpend / initialBudget) * 100)}% of Budget
              </span>
            </div>
            <div className="w-full h-3.5 bg-[#f8eaee] rounded-full border-[1.5px] border-[#292225] p-[1.5px] overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-[#E94355] rounded-l-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((spentSoFar / initialBudget) * 100))}%` }}
                title="Spent So Far"
              />
              <div
                className={`h-full ${
                  activeScenario === "splurge" ? "bg-[#b41934]" : "bg-[#F6DF79]"
                } transition-all duration-500`}
                style={{
                  width: `${Math.min(
                    Math.max(0, 100 - Math.round((spentSoFar / initialBudget) * 100) - Math.round((essentialCommitments / initialBudget) * 100)),
                    Math.round((currentSc.projectedRemaining / initialBudget) * 100)
                  )}%`,
                }}
                title="Projected Remaining Runway"
              />
              <div
                className="h-full bg-[#552139] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((essentialCommitments / initialBudget) * 100))}%` }}
                title="Bills (Recharge & Subscriptions)"
              />
            </div>
          </div>

          {/* Transparent Assumptions & Disclaimers Footer */}
          <div className="p-2.5 bg-[#FFF9F1] border border-[#292225]/30 rounded-lg text-xs text-[#5a4040] leading-relaxed flex items-start gap-2">
            <span className="material-symbols-outlined text-base text-[#552139] flex-shrink-0 mt-0.5">
              info
            </span>
            <span>
              <strong>Transparent Assumption:</strong> {currentSc.assumption}{" "}
              <em>Estimates account for remaining days and fixed obligations; not a guaranteed financial outcome.</em>
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default SpendingForecast;
