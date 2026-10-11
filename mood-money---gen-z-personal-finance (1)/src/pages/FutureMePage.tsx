import React, { useState } from "react";
import { useFinance } from "@/src/context/FinanceContext";
import SpendingForecast from "@/src/components/SpendingForecast";

export function FutureMePage() {
  const {
    currentDay,
    totalDays,
    totalSpent,
    startingBudget,
    essentialCommitments,
    commitments,
    availableBalance,
    dailySafeToSpend,
  } = useFinance();

  const [activeScenario, setActiveScenario] = useState<"baseline" | "frugal" | "splurge">("baseline");
  const remainingDays = Math.max(1, totalDays - currentDay);
  const actualDailyPace = Math.round(totalSpent / Math.max(1, currentDay));

  const scenarioMultipliers = {
    baseline: 1.0,
    frugal: 0.75,
    splurge: 1.6,
  };

  const simulatedPace = Math.round(actualDailyPace * scenarioMultipliers[activeScenario]);
  const projectedRemainingSpend = simulatedPace * remainingDays;
  const projectedTotalSpend = totalSpent + projectedRemainingSpend + essentialCommitments;
  const projectedEndBalance = startingBudget - projectedTotalSpend;
  const isSurplus = projectedEndBalance >= 0;

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b-[1.5px] border-[#292225]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border border-[#292225]" />
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold tracking-wider">
                Trajectory &amp; Predictive Runway
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#292225] font-extrabold tracking-tight">
              Future Me
            </h1>
            <p className="font-body-sm text-sm text-[#5a4040]">
              Simulate your financial state on Day 30 based on actual burn rate and scenario switches.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-xs uppercase font-bold bg-[#F6DF79] text-[#292225] px-3 py-1.5 rounded-full border border-[#292225]">
              {remainingDays} Days Ahead
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-md">
          <div className="p-space-md bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Current Burn Velocity
            </span>
            <p className="font-headline-lg font-extrabold text-[#292225] mt-1">
              ₹{actualDailyPace} / day
            </p>
            <p className="text-xs text-[#5a4040]">Target safe daily limit: ₹{dailySafeToSpend}/day</p>
          </div>
          <div className="p-space-md bg-[#F6DF79]/40 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Upcoming Fixed Bills
            </span>
            <p className="font-headline-lg font-extrabold text-[#292225] mt-1">
              ₹{essentialCommitments.toLocaleString()}
            </p>
            <p className="text-xs text-[#5a4040]">Pre-allocated recharge &amp; subscriptions</p>
          </div>
          <div
            className={`p-space-md rounded-xl border-[1.5px] border-[#292225] ${
              isSurplus ? "bg-[#F2C6D5]/40 text-[#552139]" : "bg-[#ffdad6] text-[#ba1a1a]"
            }`}
          >
            <span className="font-label-caps text-[10px] uppercase font-bold">
              {isSurplus ? "Projected Day 30 Stash" : "Projected Deficit"}
            </span>
            <p className="font-headline-lg font-extrabold mt-1">
              {isSurplus ? `+ ₹${projectedEndBalance.toLocaleString()}` : `- ₹${Math.abs(projectedEndBalance).toLocaleString()}`}
            </p>
            <p className="text-xs">
              {isSurplus
                ? "Finishing cycle with positive retained capital!"
                : "Deficit warning: burn rate exceeds remaining budget."}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Spending Forecast Component */}
      <SpendingForecast
        currentDay={currentDay}
        totalDays={totalDays}
        spentSoFar={totalSpent}
        initialBudget={startingBudget}
        essentialCommitments={essentialCommitments}
      />

      {/* Commitments Timeline Box */}
      <div className="bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-md sm:p-space-lg">
        <h3 className="font-headline-sm font-bold text-[#292225] mb-space-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#E94355] text-lg">calendar_month</span>
          <span>Known Scheduled Commitments Breakdown</span>
        </h3>
        <div className="divide-y-[1.5px] divide-[#292225]/10">
          {commitments.map((comm) => (
            <div key={comm.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-body-md font-bold text-[#292225]">{comm.title}</p>
                <p className="font-label-caps text-xs text-[#5a4040]">
                  Scheduled for Day {comm.dueDay} of 30 · {comm.category}
                </p>
              </div>
              <div className="text-right">
                <span className="font-headline-sm font-bold text-[#E94355]">
                  ₹{comm.amount}
                </span>
                <p className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
                  {comm.isPaid ? "Settled" : "Pre-Allocated"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FutureMePage;
