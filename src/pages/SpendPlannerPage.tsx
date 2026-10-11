import React, { useState } from "react";
import { useFinance, type TransactionCategory } from "@/src/context/FinanceContext";
import confetti from "canvas-confetti";

export function SpendPlannerPage() {
  const {
    startingBudget,
    budgetPlan,
    updateBudgetPlan,
    categorySpending,
    totalSpent,
  } = useFinance();

  const [allocations, setAllocations] = useState<Record<TransactionCategory, number>>(budgetPlan);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories: TransactionCategory[] = [
    "Food",
    "Transport",
    "Bills",
    "Education",
    "Personal",
    "Emergency Reserve",
    "Savings",
    "Other",
  ];

  // Presets
  const presets: { name: string; desc: string; plan: Record<TransactionCategory, number> }[] = [
    {
      name: "Balanced Baseline",
      desc: "Standard daily survival with healthy emergency buffer",
      plan: {
        Food: 3200,
        Transport: 1600,
        Bills: 1200,
        Education: 800,
        Personal: 1200,
        "Emergency Reserve": 1000,
        Savings: 800,
        Other: 200,
      },
    },
    {
      name: "Social & Campus Month",
      desc: "Prioritizes group dining, college books, and weekend hangouts",
      plan: {
        Food: 3800,
        Transport: 1400,
        Bills: 1000,
        Education: 1200,
        Personal: 1600,
        "Emergency Reserve": 500,
        Savings: 300,
        Other: 200,
      },
    },
    {
      name: "Savings First / Frugal Sprint",
      desc: "Aggressive wealth compounding; locks ₹2,500 into emergency reserves",
      plan: {
        Food: 2600,
        Transport: 1200,
        Bills: 1100,
        Education: 600,
        Personal: 800,
        "Emergency Reserve": 2000,
        Savings: 1500,
        Other: 200,
      },
    },
  ];

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const unallocated = startingBudget - totalAllocated;
  const isOverbudget = totalAllocated > startingBudget;

  const handleChange = (category: TransactionCategory, value: number) => {
    setAllocations((prev) => ({
      ...prev,
      [category]: Math.max(0, value),
    }));
    setSaveSuccess(false);
  };

  const handleApplyPreset = (presetPlan: Record<TransactionCategory, number>) => {
    setAllocations({ ...presetPlan });
    setSaveSuccess(false);
  };

  const handleSave = () => {
    updateBudgetPlan(allocations);
    setSaveSuccess(true);
    confetti({ particleCount: 40, spread: 60 });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b-[1.5px] border-[#292225]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border border-[#292225]" />
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold tracking-wider">
                ₹10,000 Allocation Studio
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#292225] font-extrabold tracking-tight">
              Spend Planner
            </h1>
            <p className="font-body-sm text-sm text-[#5a4040]">
              Distribute your starting ₹10,000 cap across lifestyle rituals, transit, and reserves.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSave}
              className="btn-3d btn-3d-cherry px-space-lg py-3 text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>Save Allocation Plan</span>
            </button>
          </div>
        </div>

        {/* Budget Allocation Balance Meter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-md">
          <div className="p-space-md bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Challenge Starting Pool
            </span>
            <p className="font-headline-lg font-extrabold text-[#292225] mt-1">
              ₹{startingBudget.toLocaleString()}
            </p>
            <p className="text-xs text-[#5a4040]">Fixed 30-day budget boundary</p>
          </div>

          <div className="p-space-md bg-white border-[1.5px] border-[#292225] rounded-xl">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Total Pre-Allocated
            </span>
            <p
              className={`font-headline-lg font-extrabold mt-1 ${
                isOverbudget ? "text-[#E94355]" : "text-[#292225]"
              }`}
            >
              ₹{totalAllocated.toLocaleString()}
            </p>
            <p className="text-xs text-[#5a4040]">
              {Math.round((totalAllocated / startingBudget) * 100)}% of pool allocated
            </p>
          </div>

          <div
            className={`p-space-md rounded-xl border-[1.5px] border-[#292225] ${
              isOverbudget
                ? "bg-[#ffdad6] text-[#ba1a1a]"
                : unallocated === 0
                ? "bg-[#F6DF79]/40 text-[#292225]"
                : "bg-[#F2C6D5]/40 text-[#552139]"
            }`}
          >
            <span className="font-label-caps text-[10px] uppercase font-bold">
              {isOverbudget ? "Over-Budget Deficit!" : "Unallocated Buffer"}
            </span>
            <p className="font-headline-lg font-extrabold mt-1">
              {isOverbudget
                ? `−₹${Math.abs(unallocated).toLocaleString()}`
                : `₹${unallocated.toLocaleString()}`}
            </p>
            <p className="text-xs">
              {isOverbudget
                ? "Allocations exceed ₹10,000! Reduce one category."
                : unallocated === 0
                ? "100% of money has a home. Fully calibrated!"
                : "Free discretionary buffer before emergency kicks in."}
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-[#F6DF79] border-[1.5px] border-[#292225] rounded-lg text-xs font-bold text-[#292225] flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Allocation plan saved! All projections and insights updated in real time.</span>
          </div>
        )}
      </div>

      {/* Comparison Presets */}
      <div className="bg-white rounded-xl border-[2px] border-[#292225] shadow-[0_4px_0px_#292225] p-space-md sm:p-space-lg">
        <h3 className="font-headline-sm font-bold text-[#292225] mb-space-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#E94355] text-lg">auto_awesome</span>
          <span>Strategy Presets (Select &amp; Tweak)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          {presets.map((preset) => (
            <div
              key={preset.name}
              className="p-space-md bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl flex flex-col justify-between hover:bg-white transition-all shadow-[1px_1px_0px_#292225]"
            >
              <div>
                <p className="font-body-md font-bold text-[#292225]">{preset.name}</p>
                <p className="text-xs text-[#5a4040] mt-1">{preset.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyPreset(preset.plan)}
                className="btn-3d btn-3d-white py-1.5 text-[11px] font-bold mt-3"
              >
                Apply Preset
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Category Allocation Sliders & Actual Spend Comparison */}
      <div className="bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-md sm:p-space-lg">
        <div className="flex justify-between items-center pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
          <h3 className="font-headline-sm font-bold text-[#292225]">
            Custom Category Allocations vs. Actual Spend
          </h3>
          <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
            Total Spent So Far: ₹{totalSpent.toLocaleString()}
          </span>
        </div>

        <div className="space-y-space-md">
          {categories.map((cat) => {
            const allocated = allocations[cat] || 0;
            const actual = categorySpending[cat] || 0;
            const pctUsed = allocated > 0 ? Math.round((actual / allocated) * 100) : 0;
            const isOverCategory = actual > allocated;

            return (
              <div
                key={cat}
                className="p-3.5 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-body-md font-bold text-[#292225]">{cat}</span>
                    <span className="font-label-caps text-[10px] text-[#5a4040] ml-2">
                      Actual: ₹{actual.toLocaleString()} ({pctUsed}% spent)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                      Planned:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        step="50"
                        value={allocated}
                        onChange={(e) => handleChange(cat, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-white border-[1.5px] border-[#292225] rounded font-mono font-bold text-sm text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Slider Control */}
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={allocated}
                  onChange={(e) => handleChange(cat, parseFloat(e.target.value) || 0)}
                  className="w-full h-2 bg-[#f8eaee] rounded-lg appearance-none cursor-pointer accent-[#E94355]"
                />

                {/* Progress bar comparing actual vs allocated */}
                <div className="flex items-center gap-2 pt-1 text-[11px] font-label-caps">
                  <div className="flex-1 h-2 bg-white rounded-full border border-[#292225]/40 overflow-hidden">
                    <div
                      className={`h-full ${isOverCategory ? "bg-[#E94355]" : "bg-[#F6DF79]"}`}
                      style={{ width: `${Math.min(100, pctUsed)}%` }}
                    />
                  </div>
                  <span
                    className={`font-bold ${
                      isOverCategory ? "text-[#E94355]" : "text-[#552139]"
                    }`}
                  >
                    {isOverCategory
                      ? `+₹${actual - allocated} Over Planned!`
                      : `₹${allocated - actual} Buffer Left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SpendPlannerPage;
