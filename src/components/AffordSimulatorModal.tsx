import React, { useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import WarpGradient from "@/src/components/ui/warp-gradient";
import { useTilt3D } from "@/src/hooks/useTilt3D";

interface AffordSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  currentDay: number;
  totalDays: number;
  essentialCommitments?: number;
  savingsGoalAmount?: number;
  onConfirmPurchase: (item: {
    name: string;
    amount: number;
    category: string;
  }) => void;
}

export type AffordVerdict =
  | "COMFORTABLY AFFORDABLE"
  | "AFFORDABLE, BUT BE CAREFUL"
  | "NOT RECOMMENDED";

export function AffordSimulatorModal({
  isOpen,
  onClose,
  availableBalance,
  currentDay,
  totalDays,
  essentialCommitments = 850,
  savingsGoalAmount = 1200,
  onConfirmPurchase,
}: AffordSimulatorModalProps) {
  const [itemName, setItemName] = useState("Vintage Leather Jacket");
  const [costStr, setCostStr] = useState("1800");
  const [category, setCategory] = useState("Wardrobe & Style");

  const { ref: dialRef, tiltProps } = useTilt3D<HTMLDivElement>({ maxTilt: 10, scale: 1.02 });

  if (!isOpen) return null;

  const costNum = Math.max(0, parseFloat(costStr) || 0);
  const remainingDays = Math.max(1, totalDays - currentDay);
  const postPurchaseBalance = availableBalance - costNum;

  const currentDailyCap = Math.round(availableBalance / remainingDays);
  const projectedDailyCap = Math.max(0, Math.round(postPurchaseBalance / remainingDays));
  const dailyCapDrop = currentDailyCap - projectedDailyCap;
  const dailyCapDropPct = currentDailyCap > 0 ? (dailyCapDrop / currentDailyCap) * 100 : 0;

  const commitmentsCovered = postPurchaseBalance >= essentialCommitments;
  const runwayDaysConsumed =
    currentDailyCap > 0 ? (costNum / currentDailyCap).toFixed(1) : "0";

  // Decision logic
  let verdict: AffordVerdict = "COMFORTABLY AFFORDABLE";
  let verdictReason = "";
  let verdictTheme = {
    badgeBg: "bg-[#F6DF79]",
    badgeText: "text-[#292225]",
    borderColor: "border-[#b89b1c]",
    boxBg: "bg-[#F6DF79]/30",
    dialColor: "#F6DF79",
  };

  if (
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
      dialColor: "#E94355",
    };
    if (postPurchaseBalance < 0) {
      verdictReason = `Purchase exceeds your available balance of ₹${availableBalance.toLocaleString()} by ₹${Math.abs(
        postPurchaseBalance
      ).toLocaleString()}. Immediate deficit!`;
    } else if (!commitmentsCovered) {
      verdictReason = `Breaches essential reserve: leaves only ₹${postPurchaseBalance.toLocaleString()}, falling short of ₹${essentialCommitments} scheduled bills (Recharge & Subscriptions).`;
    } else {
      verdictReason = `Severe runway burn: eats ${runwayDaysConsumed} entire days of safe allowance and reduces daily cap below survival baseline (₹${projectedDailyCap}/day).`;
    }
  } else if (
    dailyCapDropPct >= 18 ||
    costNum > 750 ||
    postPurchaseBalance - essentialCommitments < savingsGoalAmount
  ) {
    verdict = "AFFORDABLE, BUT BE CAREFUL";
    verdictTheme = {
      badgeBg: "bg-[#F2C6D5]",
      badgeText: "text-[#552139]",
      borderColor: "border-[#884b65]",
      boxBg: "bg-[#F2C6D5]/35",
      dialColor: "#F2C6D5",
    };
    verdictReason = `Feasible, but noticeably tightens your remaining ${remainingDays} days. Daily cap drops by ₹${dailyCapDrop}/day. Requires disciplined zero-splurge days to compensate.`;
  } else {
    verdict = "COMFORTABLY AFFORDABLE";
    verdictTheme = {
      badgeBg: "bg-[#F6DF79]",
      badgeText: "text-[#292225]",
      borderColor: "border-[#b89b1c]",
      boxBg: "bg-[#F6DF79]/30",
      dialColor: "#F6DF79",
    };
    verdictReason = `Clean green signal! Essential bills (₹${essentialCommitments}) remain 100% covered, emergency cushion stays untouched, and your daily cap stays steady at ₹${projectedDailyCap}/day.`;
  }

  const handleConfirm = () => {
    if (costNum <= 0) return;
    onConfirmPurchase({
      name: itemName || "Approved Simulator Purchase",
      amount: costNum,
      category,
    });
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E94355", "#F6DF79", "#552139"],
    });
  };

  const handleSkip = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      colors: ["#F6DF79", "#F2C6D5"],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: "spring", damping: 26, stiffness: 360 }}
        className="bg-[#FFF9F1] border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] rounded-2xl shadow-[0_8px_0px_#292225,0_24px_48px_rgba(41,34,37,0.3)] w-full max-w-2xl overflow-hidden relative z-10 my-auto"
      >
        {/* Header with Warp Gradient Banner */}
        <div className="relative isolate overflow-hidden text-white p-space-md sm:p-space-lg border-b-[2px] border-[#292225]">
          <WarpGradient
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            colors={["#552139", "#E94355", "#F2C6D5", "#FFF9F1"]}
            pattern="bands"
            density={0.3}
            speed={0.16}
            warp={0.55}
            glossyHighlights={true}
            vignette={true}
            satinSheen={true}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#552139]/80 pointer-events-none z-[2]"
          />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F6DF79] text-xl">spark</span>
              <span className="font-label-caps uppercase tracking-wider text-[#F6DF79] font-bold text-xs">
                The Decision Studio • Live Stress Test
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#292225] flex items-center justify-center font-bold text-sm border border-white/40 cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
          <h3 className="font-headline-lg text-white mt-1.5 font-bold tracking-tight">
            Can I afford it?
          </h3>
          <p className="text-white/80 text-xs sm:text-sm">
            Evaluate prospective purchases against your {remainingDays} remaining challenge days without altering your actual balance until confirmed.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-space-md sm:p-space-lg space-y-space-md max-h-[75vh] overflow-y-auto">
          {/* Top Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-sm items-center">
            <div className="sm:col-span-7">
              <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                Proposed Purchase Item
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Leather jacket, Noise-cancelling headphones"
                className="w-full px-3 py-2 bg-white border-[1.5px] border-[#292225] rounded-lg font-body-md text-sm shadow-[2px_2px_0px_#292225] focus:outline-none focus:ring-2 focus:ring-[#E94355]"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border-[1.5px] border-[#292225] rounded-lg font-body-md text-sm shadow-[2px_2px_0px_#292225] focus:outline-none focus:ring-2 focus:ring-[#E94355]"
              >
                <option value="Wardrobe & Style">Wardrobe &amp; Style</option>
                <option value="Social Night Out">Social Night Out</option>
                <option value="Tech & Gear">Tech &amp; Gear</option>
                <option value="Impulsive Food/Snack">Impulsive Food/Snack</option>
                <option value="Campus / Books">Campus / Books</option>
              </select>
            </div>
          </div>

          {/* Interactive Price Dial & Slider Stage */}
          <div
            ref={dialRef}
            {...tiltProps}
            className="p-3.5 bg-white border-[2px] border-[#292225] rounded-xl shadow-[0_4px_0px_#292225] relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                Price Dial Simulator
              </span>
              <span className="font-label-caps text-xs text-[#E94355] font-bold">
                ₹{costNum.toLocaleString()} INR
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={Math.max(5000, availableBalance + 1000)}
                step="50"
                value={costNum}
                onChange={(e) => setCostStr(e.target.value)}
                className="w-full h-2.5 bg-[#f8eaee] rounded-lg appearance-none cursor-pointer accent-[#E94355]"
              />
              <input
                type="number"
                min="0"
                value={costStr}
                onChange={(e) => setCostStr(e.target.value)}
                className="w-24 px-2 py-1 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded font-label-numeric-md text-right font-bold text-sm"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold mr-1">
                Quick Presets:
              </span>
              {[250, 600, 1200, 1800, 2500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCostStr(preset.toString())}
                  className="px-2 py-0.5 bg-[#FFF9F1] hover:bg-[#F6DF79] text-[10px] font-label-caps font-bold border border-[#292225] rounded shadow-[1px_1px_0px_#292225] transition-colors"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Calculation Matrix */}
          <div
            className={`p-space-md rounded-xl border-[2px] border-[#292225] border-b-[4px] ${verdictTheme.borderColor} ${verdictTheme.boxBg} shadow-[0_4px_0px_#292225] transition-colors`}
          >
            {/* Outcome Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                Stress-Test Verdict
              </span>
              <span
                className={`font-label-caps text-xs uppercase font-extrabold px-3 py-1 rounded-full border border-[#292225] shadow-[1.5px_1.5px_0px_#292225] ${verdictTheme.badgeBg} ${verdictTheme.badgeText}`}
              >
                {verdict}
              </span>
            </div>

            {/* 4-Box Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-2 bg-white rounded-lg border border-[#292225] mb-2.5 shadow-sm">
              <div className="p-1">
                <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                  Available Stash
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
                  ₹{projectedDailyCap}{" "}
                  <span className="text-[10px]">(-₹{dailyCapDrop})</span>
                </p>
              </div>
              <div className="p-1 border-t sm:border-t-0 sm:border-l border-[#292225]/15">
                <span className="font-label-caps text-[10px] text-[#5a4040] uppercase">
                  Runway Impact
                </span>
                <p className="font-bold text-sm text-[#552139]">
                  −{runwayDaysConsumed} Days
                </p>
              </div>
            </div>

            {/* Secondary Checks: Commitments & Savings Protection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 font-label-caps text-[11px]">
              <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded border border-[#292225]/20">
                <span className="material-symbols-outlined text-[16px] text-[#552139]">
                  {commitmentsCovered ? "check_circle" : "cancel"}
                </span>
                <span>
                  Bills Protected:{" "}
                  <strong>{commitmentsCovered ? "₹850 Safe" : "DEFICIT"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded border border-[#292225]/20">
                <span className="material-symbols-outlined text-[16px] text-[#552139]">
                  {postPurchaseBalance >= savingsGoalAmount ? "shield" : "warning"}
                </span>
                <span>
                  Cushion State:{" "}
                  <strong>
                    {postPurchaseBalance >= savingsGoalAmount ? "Untouched" : "Eats into Vault"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Reason Explanation */}
            <p className="text-xs text-[#292225] leading-relaxed pt-1 border-t border-[#292225]/15">
              <strong>Rationale:</strong> {verdictReason}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={postPurchaseBalance < 0 || costNum <= 0}
              className={`btn-3d btn-3d-cherry w-full sm:flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 ${
                postPurchaseBalance < 0 || costNum <= 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span>Confirm &amp; Add to Ledger</span>
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
      </motion.div>
    </div>
  );
}

export default AffordSimulatorModal;
