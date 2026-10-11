import React from "react";

interface FinancialHealthOrbProps {
  spentSoFar: number;
  initialBudget: number;
  currentDay: number;
  totalDays: number;
  essentialCommitments: number;
  className?: string;
}

export function FinancialHealthOrb({
  spentSoFar = 3160,
  initialBudget = 10000,
  currentDay = 12,
  totalDays = 30,
  essentialCommitments = 850,
  className = "",
}: FinancialHealthOrbProps) {
  const timeElapsedPct = (currentDay / totalDays) * 100;
  const budgetSpentPct = (spentSoFar / initialBudget) * 100;
  const remainingBalance = initialBudget - spentSoFar;
  const bufferDelta = Math.round(timeElapsedPct - budgetSpentPct);
  const isHealthy = budgetSpentPct <= timeElapsedPct && remainingBalance >= essentialCommitments;

  return (
    <div
      className={`bg-[#F2C6D5]/40 border-[1.5px] border-[#292225] border-b-[3.5px] border-b-[#884b65] rounded-xl p-space-md shadow-[0_3px_0px_#292225] flex flex-col sm:flex-row sm:items-center justify-between gap-space-md ${className}`}
    >
      <div className="flex items-center gap-space-md">
        {/* Dimensional Glass Orb with Layered Concentric Rings */}
        <div className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
          {/* Outer Layered Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#292225] bg-gradient-to-tr from-[#552139] via-[#E94355] to-[#F6DF79] shadow-[0_2px_4px_rgba(41,34,37,0.3)] animate-orb-pulse" />
          {/* Inner Specular Core */}
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[#FFF9F1] via-[#F6DF79] to-[#E94355] border border-[#292225] shadow-inner flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[#552139] text-base font-bold"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              graphic_eq
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-label-caps text-label-caps text-[#552139] uppercase tracking-widest font-bold">
              Financial Health Status
            </p>
            <span
              className={`font-label-caps text-[10px] px-2 py-0.5 rounded-full border border-[#292225] font-extrabold uppercase ${
                isHealthy
                  ? "bg-[#F6DF79] text-[#292225]"
                  : "bg-[#E94355] text-white"
              }`}
            >
              {isHealthy ? `Pace Optimal (+${bufferDelta}% Buffer)` : "Pace Strained"}
            </span>
          </div>
          <p className="font-headline-sm text-headline-sm text-[#292225] font-semibold leading-tight">
            You&apos;re finding your rhythm.
          </p>
          <p className="font-body-sm text-xs text-[#5a4040] mt-0.5 max-w-md">
            Spending velocity ({budgetSpentPct.toFixed(1)}%) is tracking {bufferDelta}% below cycle timeline ({timeElapsedPct.toFixed(0)}%). Upcoming bills (₹{essentialCommitments}) are fully pre-allocated.
          </p>
        </div>
      </div>

      {/* 5-bar Segmented Visual Meter */}
      <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white px-space-md py-space-xs rounded-lg border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225]">
        <span className="font-label-caps text-label-caps text-[#292225]/70 mr-1 uppercase font-bold">
          Pace
        </span>
        <div className="w-2.5 h-6 rounded-sm bg-[#E94355] border-[1px] border-[#292225]" />
        <div className="w-2.5 h-6 rounded-sm bg-[#E94355] border-[1px] border-[#292225]" />
        <div className="w-2.5 h-6 rounded-sm bg-[#F6DF79] border-[1px] border-[#292225]" />
        <div className="w-2.5 h-6 rounded-sm bg-[#F6DF79] border-[1px] border-[#292225]" />
        <div className="w-2.5 h-6 rounded-sm bg-[#e4d7db] border-[1px] border-[#292225]/40" />
      </div>
    </div>
  );
}

export default FinancialHealthOrb;
