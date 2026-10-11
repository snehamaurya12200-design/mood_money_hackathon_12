import React, { useState } from "react";
import { useFinance } from "@/src/context/FinanceContext";
import WarpGradient, { MOOD_MONEY_WARP_CONFIG } from "@/src/components/ui/warp-gradient";
import { useTilt3D } from "@/src/hooks/useTilt3D";
import confetti from "canvas-confetti";

export function CanIAffordItPage() {
  const {
    availableBalance,
    currentDay,
    totalDays,
    essentialCommitments,
    savingsGoals,
    addTransaction,
  } = useFinance();

  const [itemName, setItemName] = useState("Vintage Leather Jacket");
  const [costStr, setCostStr] = useState("1800");
  const [category, setCategory] = useState("Wardrobe & Style");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState<string | null>(null);

  const { ref: stageRef, tiltProps } = useTilt3D<HTMLDivElement>({ maxTilt: 8, scale: 1.01 });

  const activeGoal = savingsGoals[0] || { currentAmount: 1200, targetAmount: 2000 };
  const parsedCost = parseFloat(costStr);
  const isCostValid = Number.isFinite(parsedCost) && !Number.isNaN(parsedCost) && parsedCost > 0;
  const costNum = isCostValid ? Math.round(parsedCost * 100) / 100 : 0;

  const remainingDays = Math.max(1, totalDays - currentDay);
  const safeCommitments = Number.isFinite(essentialCommitments) ? essentialCommitments : 0;
  const postPurchaseBalance = availableBalance - costNum;

  // Authoritative daily allowance calculation accounting for essential commitments:
  const currentDailyCap = Math.max(
    0,
    Math.round((availableBalance - safeCommitments) / remainingDays)
  );
  const projectedDailyCap = Math.max(
    0,
    Math.round((postPurchaseBalance - safeCommitments) / remainingDays)
  );
  const dailyCapDrop = Math.max(0, currentDailyCap - projectedDailyCap);
  const dailyCapDropPct = currentDailyCap > 0 ? (dailyCapDrop / currentDailyCap) * 100 : 0;
  const commitmentsCovered = postPurchaseBalance >= safeCommitments;
  const runwayDaysConsumed = currentDailyCap > 0 ? (costNum / currentDailyCap).toFixed(1) : "0";

  // Decision logic
  let verdict: "COMFORTABLY AFFORDABLE" | "AFFORDABLE, BUT BE CAREFUL" | "NOT RECOMMENDED" =
    "COMFORTABLY AFFORDABLE";
  let verdictReason = "";
  let verdictTheme = {
    badgeBg: "bg-[#F6DF79]",
    badgeText: "text-[#292225]",
    borderColor: "border-[#b89b1c]",
    boxBg: "bg-[#F6DF79]/30",
  };

  if (!isCostValid) {
    verdict = "NOT RECOMMENDED";
    verdictTheme = {
      badgeBg: "bg-[#E94355]",
      badgeText: "text-white",
      borderColor: "border-[#ba1a1a]",
      boxBg: "bg-[#ffdad6]",
    };
    verdictReason = "Please enter a valid, positive purchase amount to run the affordability simulation.";
  } else if (
    postPurchaseBalance < 0 ||
    !commitmentsCovered ||
    projectedDailyCap < 120 ||
    costNum > availableBalance * 0.45
  ) {
    verdict = "NOT RECOMMENDED";
    verdictTheme = {
      badgeBg: "bg-[#E94355]",
      badgeText: "text-white",
      borderColor: "border-[#ba1a1a]",
      boxBg: "bg-[#ffdad6]",
    };

    if (postPurchaseBalance < 0) {
      verdictReason = `Exceeds available funds by ₹${Math.abs(postPurchaseBalance).toLocaleString()}! Would cause an immediate challenge deficit.`;
    } else if (!commitmentsCovered) {
      verdictReason = `Leaves only ₹${postPurchaseBalance.toLocaleString()}, which falls short of covering ₹${safeCommitments} in scheduled obligations (Mobile Recharge & Subscriptions).`;
    } else {
      verdictReason = `Severe runway friction: burns ${runwayDaysConsumed} entire days of safe allowance and pulls your daily cap down to ₹${projectedDailyCap}/day.`;
    }
  } else if (
    dailyCapDropPct >= 18 ||
    costNum > 750 ||
    postPurchaseBalance - safeCommitments < activeGoal.currentAmount
  ) {
    verdict = "AFFORDABLE, BUT BE CAREFUL";
    verdictTheme = {
      badgeBg: "bg-[#F2C6D5]",
      badgeText: "text-[#552139]",
      borderColor: "border-[#884b65]",
      boxBg: "bg-[#F2C6D5]/35",
    };
    verdictReason = `Feasible, but tightens your runway. Your daily cap drops by ₹${dailyCapDrop}/day for the next ${remainingDays} days. Will require 2–3 disciplined no-spend days to recover buffer.`;
  } else {
    verdict = "COMFORTABLY AFFORDABLE";
    verdictTheme = {
      badgeBg: "bg-[#F6DF79]",
      badgeText: "text-[#292225]",
      borderColor: "border-[#b89b1c]",
      boxBg: "bg-[#F6DF79]/30",
    };
    verdictReason = `Clean green signal! Scheduled commitments (₹${safeCommitments}) remain 100% pre-funded and your daily allowance stays steady at ₹${projectedDailyCap}/day.`;
  }

  const handleConfirmPurchase = () => {
    if (!isCostValid || costNum <= 0 || postPurchaseBalance < 0 || isSubmitting) return;
    setIsSubmitting(true);
    addTransaction({
      name: itemName || "Simulated Purchase",
      amount: costNum,
      category: "Personal",
      type: "expense",
      date: `Day ${currentDay.toString().padStart(2, "0")} · Approved Simulator`,
      dayNumber: currentDay,
      merchant: category,
      note: `Stress-tested decision (${verdict})`,
    });
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E94355", "#F6DF79", "#552139"],
    });
    setConfirmedSuccess(`Recorded "₹${costNum.toLocaleString()} for ${itemName}" to your ledger!`);
    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedSuccess(null);
    }, 4000);
  };

  const handleSkip = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      colors: ["#F6DF79", "#F2C6D5"],
    });
    alert("Self-control streak protected! ₹" + costNum.toLocaleString() + " saved for your cycle.");
  };

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* Studio Banner */}
      <div className="relative isolate overflow-hidden rounded-2xl border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] shadow-[0_6px_0px_#292225] p-space-lg sm:p-space-xl text-white">
        <WarpGradient
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          colors={MOOD_MONEY_WARP_CONFIG.colors}
          pattern="bands"
          density={0.3}
          speed={0.16}
          warp={0.6}
          glossyHighlights={true}
          vignette={true}
          satinSheen={true}
        />
        {/* Soft deep burgundy wash for contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#552139]/80 pointer-events-none z-[2]"
        />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#F6DF79] text-xl">spark</span>
            <span className="font-label-caps text-xs text-[#F6DF79] uppercase font-bold tracking-widest">
              The Decision Studio · Purchase Simulator
            </span>
          </div>
          <h1 className="font-display-hero text-3xl sm:text-5xl font-extrabold tracking-tight">
            Can I afford it?
          </h1>
          <p className="font-body-lg text-sm sm:text-base text-white/90 mt-2 max-w-xl">
            Stress-test impulsive desires against your remaining {remainingDays} challenge days.
            Previewing never changes your balance until you explicitly confirm.
          </p>
        </div>
      </div>

      {/* Main Interactive Stage with 3D Tilt */}
      <div
        ref={stageRef}
        {...tiltProps}
        className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl space-y-space-lg"
      >
        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md">
          <div className="sm:col-span-8">
            <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1.5">
              What do you want to buy?
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Vintage Leather Jacket, Weekend Concert Ticket"
              className="w-full px-4 py-2.5 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg font-body-md text-sm shadow-[2px_2px_0px_#292225] focus:outline-none focus:ring-2 focus:ring-[#E94355]"
            />
          </div>
          <div className="sm:col-span-4">
            <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1.5">
              Category Context
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg font-body-md text-sm shadow-[2px_2px_0px_#292225]"
            >
              <option value="Wardrobe & Style">Wardrobe &amp; Style</option>
              <option value="Social Night Out">Social Night Out</option>
              <option value="Tech & Gear">Tech &amp; Gear</option>
              <option value="Impulsive Food/Snack">Impulsive Food/Snack</option>
              <option value="Campus / Books">Campus / Books</option>
            </select>
          </div>
        </div>

        {/* Interactive Price Dial Stage */}
        <div className="p-space-md bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
              Proposed Cost Dial
            </span>
            <span className="font-headline-sm font-extrabold text-[#E94355]">
              ₹{costNum.toLocaleString()} INR
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={Math.max(4000, availableBalance + 1000)}
              step="50"
              value={costNum}
              onChange={(e) => setCostStr(e.target.value)}
              className="w-full h-3 bg-white rounded-lg appearance-none cursor-pointer accent-[#E94355]"
            />
            <input
              type="number"
              min="0"
              value={costStr}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (!val.startsWith("-") && Number(val) >= 0)) {
                  setCostStr(val);
                }
              }}
              className="w-28 px-2 py-1.5 bg-white border-[1.5px] border-[#292225] rounded font-mono font-bold text-base text-right"
            />
          </div>
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold mr-1">
              Quick Test:
            </span>
            {[250, 600, 1200, 1800, 2500, 3500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCostStr(preset.toString())}
                className="px-2.5 py-1 bg-white hover:bg-[#F6DF79] text-xs font-label-caps font-bold border border-[#292225] rounded shadow-[1px_1px_0px_#292225] transition-colors"
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Factor Mathematical Impact Matrix */}
        <div
          className={`p-space-lg rounded-xl border-[2px] border-[#292225] border-b-[4px] ${verdictTheme.borderColor} ${verdictTheme.boxBg} shadow-[0_4px_0px_#292225]`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
              Simulator Recommendation
            </span>
            <span
              className={`font-label-caps text-xs uppercase font-extrabold px-3 py-1 rounded-full border border-[#292225] shadow-[1.5px_1.5px_0px_#292225] ${verdictTheme.badgeBg} ${verdictTheme.badgeText}`}
            >
              {verdict}
            </span>
          </div>

          {/* 4-Box Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-2.5 bg-white rounded-lg border border-[#292225] mb-3 shadow-sm">
            <div className="p-1">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                Current Stash
              </span>
              <p className="font-bold text-sm text-[#292225]">
                ₹{availableBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-1 border-l border-[#292225]/15">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                Post-Purchase
              </span>
              <p
                className={`font-bold text-sm ${
                  postPurchaseBalance < 0 ? "text-[#E94355]" : "text-[#292225]"
                }`}
              >
                ₹{postPurchaseBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-1 border-t sm:border-t-0 sm:border-l border-[#292225]/15">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                New Daily Cap
              </span>
              <p className="font-bold text-sm text-[#E94355]">
                ₹{projectedDailyCap} <span className="text-[10px]">(-₹{dailyCapDrop})</span>
              </p>
            </div>
            <div className="p-1 border-t sm:border-t-0 sm:border-l border-[#292225]/15">
              <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                Runway Burn
              </span>
              <p className="font-bold text-sm text-[#552139]">{runwayDaysConsumed} Days</p>
            </div>
          </div>

          {/* Secondary Commitments Check */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs font-label-caps">
            <div className="flex items-center gap-2 p-2 bg-white/70 rounded border border-[#292225]/20">
              <span className="material-symbols-outlined text-base text-[#552139]">
                {commitmentsCovered ? "verified" : "warning"}
              </span>
              <span>
                Bills Protected:{" "}
                <strong>{commitmentsCovered ? `₹${safeCommitments} Safe` : "DEFICIT HAZARD"}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/70 rounded border border-[#292225]/20">
              <span className="material-symbols-outlined text-base text-[#552139]">
                {postPurchaseBalance >= activeGoal.currentAmount ? "shield" : "report"}
              </span>
              <span>
                Emergency Cushion:{" "}
                <strong>
                  {postPurchaseBalance >= activeGoal.currentAmount
                    ? "Safe in Vault"
                    : "Threatened"}
                </strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-[#292225] leading-relaxed pt-2 border-t border-[#292225]/15">
            <strong>Detailed Rationale:</strong> {verdictReason}
          </p>
        </div>

        {confirmedSuccess && (
          <div className="p-3 bg-[#F6DF79] border-[1.5px] border-[#292225] rounded-lg text-xs font-bold text-[#292225] flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{confirmedSuccess}</span>
          </div>
        )}

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
          <button
            type="button"
            onClick={handleConfirmPurchase}
            disabled={!isCostValid || postPurchaseBalance < 0 || costNum <= 0 || isSubmitting}
            className={`btn-3d btn-3d-cherry w-full sm:flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 ${
              !isCostValid || postPurchaseBalance < 0 || costNum <= 0 || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span>{isSubmitting ? "Processing..." : "Confirm & Add to Ledger"}</span>
            <span className="material-symbols-outlined text-[16px]">done</span>
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="btn-3d btn-3d-yellow w-full sm:flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
          >
            <span>Skip &amp; Protect Streak ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanIAffordItPage;
