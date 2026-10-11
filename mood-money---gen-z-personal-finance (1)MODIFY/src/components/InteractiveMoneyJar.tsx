import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useTilt3D } from "@/src/hooks/useTilt3D";

export interface InteractiveMoneyJarProps {
  currentAmount?: number;
  targetAmount?: number;
  goalTitle?: string;
  onContribute?: (amount: number) => void;
  // Aliases for compatibility
  savingsAmount?: number;
  savingsGoal?: number;
  onTopUp?: (amount: number) => void;
  className?: string;
}

interface DroppingCoin {
  id: number;
  amount: number;
  xOffset: number;
  rotation: number;
}

interface FloatingCelebration {
  id: number;
  amount: number;
}

export function InteractiveMoneyJar({
  currentAmount: propCurrentAmount,
  targetAmount: propTargetAmount,
  goalTitle = "Emergency Cushion Vault",
  onContribute,
  savingsAmount: fallbackSavingsAmount,
  savingsGoal: fallbackSavingsGoal,
  onTopUp,
  className = "",
}: InteractiveMoneyJarProps) {
  // Resolve actual current and target amounts
  const currentAmount = propCurrentAmount ?? fallbackSavingsAmount ?? 0;
  const targetAmount = Math.max(1, propTargetAmount ?? fallbackSavingsGoal ?? 2000);
  const handleDepositCallback = onContribute ?? onTopUp;

  const [droppingCoins, setDroppingCoins] = useState<DroppingCoin[]>([]);
  const [floatingBadges, setFloatingBadges] = useState<FloatingCelebration[]>([]);
  const [isJiggling, setIsJiggling] = useState(false);
  const [isSurging, setIsSurging] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmountStr, setCustomAmountStr] = useState("250");
  const [justCelebratedGoal, setJustCelebratedGoal] = useState(false);

  const { ref, tiltProps } = useTilt3D<HTMLDivElement>({ maxTilt: 6, scale: 1.01 });

  const progressPct = Math.min(100, Math.round((currentAmount / targetAmount) * 100));
  const isGoalReached = currentAmount >= targetAmount;

  // Calculate dynamic coin count based on progress (3 minimum, up to 26 max)
  const maxCoins = 26;
  const minCoins = 3;
  const coinCount = Math.min(
    maxCoins,
    Math.max(minCoins, Math.round((currentAmount / targetAmount) * maxCoins))
  );

  const triggerJarJiggle = () => {
    setIsJiggling(true);
    setTimeout(() => setIsJiggling(false), 480);
  };

  const handleDeposit = (amount: number) => {
    if (amount <= 0) return;

    const depositId = Date.now();
    const xOffset = (Math.random() - 0.5) * 32;
    const rotation = (Math.random() - 0.5) * 70;

    // 1. Trigger falling 3D coin animation through slot
    setDroppingCoins((prev) => [...prev, { id: depositId, amount, xOffset, rotation }]);
    setTimeout(() => {
      setDroppingCoins((prev) => prev.filter((c) => c.id !== depositId));
    }, 700);

    // 2. Trigger floating celebration bubble
    setFloatingBadges((prev) => [...prev, { id: depositId, amount }]);
    setTimeout(() => {
      setFloatingBadges((prev) => prev.filter((b) => b.id !== depositId));
    }, 1400);

    // 3. Trigger physical jar jiggle & liquid wave surge when coin impacts
    setTimeout(() => {
      triggerJarJiggle();
      setIsSurging(true);
      setTimeout(() => setIsSurging(false), 800);
    }, 240);

    // 4. Fire callback
    if (handleDepositCallback) {
      handleDepositCallback(amount);
    }

    // 5. Celebration sparkles
    const willReachGoal = currentAmount + amount >= targetAmount;
    if (willReachGoal) {
      setJustCelebratedGoal(true);
      setTimeout(() => setJustCelebratedGoal(false), 3500);
      confetti({
        particleCount: 90,
        spread: 95,
        origin: { y: 0.6 },
        colors: ["#E94355", "#F6DF79", "#552139", "#FFFFFF", "#F2C6D5"],
      });
    } else {
      confetti({
        particleCount: 30,
        spread: 55,
        origin: { y: 0.68 },
        colors: ["#F6DF79", "#E94355", "#552139"],
      });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmountStr);
    if (!isNaN(val) && val > 0) {
      handleDeposit(val);
      setShowCustomAmount(false);
    }
  };

  return (
    <div
      ref={ref}
      {...tiltProps}
      className={`relative bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_6px_0px_#292225,0_14px_28px_rgba(41,34,37,0.12)] p-space-md flex flex-col justify-between overflow-hidden select-none transition-all ${
        isGoalReached || justCelebratedGoal
          ? "ring-3 ring-[#F6DF79] shadow-[0_6px_0px_#292225,0_0_28px_rgba(246,223,121,0.55)]"
          : ""
      } ${className}`}
    >
      {/* ======================================================== */}
      {/* 1. TOP HEADER & PROGRESS BADGE */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between z-20 mb-2">
        <div className="inline-flex items-center gap-1.5 bg-[#FFF9F1] px-2.5 py-1 rounded-full border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225]">
          <span
            className={`w-2 h-2 rounded-full ${
              isGoalReached ? "bg-[#F6DF79] animate-ping" : "bg-[#E94355] animate-pulse"
            }`}
          />
          <span className="font-label-caps text-[10px] sm:text-xs text-[#292225] tracking-widest font-bold uppercase">
            Interactive 3D Jar
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerJarJiggle}
            title="Tap to shake jar"
            className="text-[10px] text-[#552139] hover:text-[#E94355] font-bold underline cursor-pointer"
          >
            Shake Jar 🫙
          </button>
          <span
            className={`font-label-caps text-[10px] px-2.5 py-0.5 rounded border border-[#292225] font-extrabold ${
              isGoalReached
                ? "bg-[#E94355] text-white animate-pulse"
                : "bg-[#F6DF79] text-[#292225]"
            }`}
          >
            {progressPct}% FILLED
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 3D MONEY JAR STAGE (PERSPECTIVE & LAYERED SURFACES) */}
      {/* ======================================================== */}
      <div
        onClick={triggerJarJiggle}
        className={`relative my-2 py-2 flex items-center justify-center cursor-pointer perspective-1000 ${
          isJiggling ? "animate-jar-jiggle" : ""
        }`}
        title="Click or tap to inspect and jiggle the 3D Money Jar!"
      >
        {/* Floating Contribution Celebration Badges */}
        {floatingBadges.map((badge) => (
          <div
            key={badge.id}
            className="absolute top-2 z-50 pointer-events-none animate-float-up-badge bg-[#F6DF79] text-[#292225] border-[1.5px] border-[#292225] shadow-[0_4px_0_#292225] px-3 py-1 rounded-full text-xs font-black flex items-center gap-1"
          >
            <span>+ ₹{badge.amount}</span>
            <span className="text-[10px] uppercase font-bold text-[#552139]">Vaulted!</span>
            <span>✨</span>
          </div>
        ))}

        {/* Animated Dropping Coins from Top Slot */}
        {droppingCoins.map((coin) => (
          <div
            key={coin.id}
            style={{
              left: `calc(50% + ${coin.xOffset}px - 14px)`,
              transform: `rotate(${coin.rotation}deg)`,
            }}
            className="absolute top-0 z-40 w-7 h-7 rounded-full bg-gradient-to-tr from-[#bfa531] via-[#F6DF79] to-white border-[1.5px] border-[#292225] shadow-[0_4px_8px_rgba(41,34,37,0.4),0_2px_0_#bfa531] animate-coin-drop flex items-center justify-center font-bold text-[10px] text-[#292225]"
          >
            ₹
          </div>
        ))}

        {/* The 3D Cherry Jar Assembly */}
        <div className="relative w-44 sm:w-52 h-56 sm:h-64 flex flex-col items-center preserve-3d">
          {/* Jar Top Faceted Lid Knob with Specular Highlight */}
          <div className="w-8 h-3.5 rounded-t-lg bg-gradient-to-r from-[#292225] via-[#552139] to-[#292225] border-[1.5px] border-[#292225] shadow-[0_1px_3px_rgba(0,0,0,0.4)] z-30 flex items-center justify-center">
            <span className="w-3.5 h-0.5 bg-[#F6DF79]/80 rounded-full" />
          </div>

          {/* Cherry-Red Metallic Lid with Extruded Lower Edge */}
          <div className="w-28 sm:w-34 h-6 bg-gradient-to-r from-[#552139] via-[#E94355] to-[#552139] border-[2px] border-[#292225] rounded-t-xl shadow-[0_4px_0px_#292225,inset_0_1.5px_0_rgba(255,255,255,0.45)] relative z-25 flex items-center justify-center">
            {/* Inner Coin Slot with Depth */}
            <div className="w-12 h-1.5 bg-[#292225] rounded-full border border-white/25 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85)] relative overflow-hidden">
              <div className="absolute inset-x-2 top-0 h-[0.5px] bg-[#F6DF79]/70" />
            </div>
          </div>

          {/* Jar Metallic Neck Band (Butter Yellow with Extruded Bevel) */}
          <div className="w-24 sm:w-28 h-2.5 bg-gradient-to-r from-[#b89b1c] via-[#F6DF79] to-[#b89b1c] border-x-[2px] border-b-[1.5px] border-[#292225] z-20 shadow-sm flex items-center justify-center">
            <span className="w-full h-[1px] bg-white/50" />
          </div>

          {/* Main Glass Jar Body with Layered Shadows & Curvature Highlights */}
          <div className="relative w-36 sm:w-44 flex-1 bg-gradient-to-b from-white/75 via-[#F2C6D5]/25 to-[#FFF9F1]/85 rounded-b-[2.8rem] border-[2px] border-[#292225] shadow-[inset_0_6px_18px_rgba(255,255,255,0.95),inset_0_-12px_24px_rgba(85,33,57,0.22),0_8px_18px_rgba(41,34,37,0.14)] overflow-hidden flex flex-col justify-end p-2 z-10 backdrop-blur-[2px]">
            {/* Glass Curvature Specular Highlight (Left Tube) */}
            <div className="absolute left-2.5 top-2 bottom-6 w-2 bg-gradient-to-b from-white/95 via-white/40 to-transparent rounded-full pointer-events-none z-20" />
            {/* Glass Ambient Rim Reflection (Right Tube) */}
            <div className="absolute right-2 top-3 bottom-6 w-1 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full pointer-events-none z-20" />
            {/* Diagonal Specular Glare Sweep Beam */}
            <div className="absolute -right-6 -top-10 w-20 h-56 bg-gradient-to-r from-transparent via-white/35 to-transparent rotate-12 pointer-events-none blur-[1px] z-20 animate-gold-shimmer" />

            {/* Frosted Etched Graduation Ticks & Target Labels */}
            <div className="absolute right-2.5 top-4 bottom-5 flex flex-col justify-between items-end opacity-55 pointer-events-none font-mono text-[8px] text-[#552139] z-20 select-none">
              <div className="flex items-center gap-1">
                <span>100%</span>
                <span className="w-2 h-[1px] bg-[#552139]" />
              </div>
              <div className="flex items-center gap-1">
                <span>75%</span>
                <span className="w-1.5 h-[1px] bg-[#552139]" />
              </div>
              <div className="flex items-center gap-1">
                <span>50%</span>
                <span className="w-1.5 h-[1px] bg-[#552139]" />
              </div>
              <div className="flex items-center gap-1">
                <span>25%</span>
                <span className="w-1.5 h-[1px] bg-[#552139]" />
              </div>
            </div>

            {/* Liquid / Cherry-Red Savings Fill with 3D Surface Meniscus */}
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#E94355]/40 via-[#E94355]/25 to-[#F6DF79]/30 transition-all duration-700 ease-out pointer-events-none z-5 ${
                isSurging ? "animate-liquid-surge" : ""
              }`}
              style={{ height: `${progressPct}%` }}
            >
              {/* Surface Meniscus Wave Line */}
              {progressPct > 3 && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#F6DF79] via-white to-[#F6DF79] border-t border-[#292225]/40 opacity-85 animate-meniscus shadow-[0_0_6px_rgba(246,223,121,0.8)]" />
              )}
            </div>

            {/* Layered Physical 3D Coins Accumulation */}
            <div className="relative z-15 w-full flex flex-wrap-reverse justify-center items-end gap-1.5 pb-2">
              {Array.from({ length: coinCount }).map((_, index) => {
                const rotationDeg = (index * 41) % 60 - 30;
                const translateYPx = index % 3 === 0 ? -1 : index % 2 === 0 ? 0 : -2.5;
                return (
                  <div
                    key={index}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#bfa531] via-[#F6DF79] to-white border-[1.5px] border-[#292225] shadow-[0_2.5px_0_#9a8118,0_4px_6px_rgba(41,34,37,0.35),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-center font-bold text-[10px] text-[#292225] transition-transform duration-300 hover:scale-115 cursor-pointer"
                    style={{
                      transform: `rotate(${rotationDeg}deg) translateY(${translateYPx}px)`,
                    }}
                    title={`Accumulated coin ${index + 1}`}
                  >
                    <span className="opacity-90 font-mono">₹</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wooden / Brass Display Stand Pedestal with 3D Bevel & Contact Shadow */}
          <div className="w-40 sm:w-48 h-4.5 bg-gradient-to-r from-[#b89b1c] via-[#F6DF79] to-[#b89b1c] border-[2px] border-[#292225] rounded-full shadow-[0_6px_0px_#292225,0_12px_24px_rgba(41,34,37,0.3)] mt-1 relative z-5 flex items-center justify-center">
            <span className="w-32 h-[1px] bg-white/50" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BALANCE METRICS & GOAL STATUS */}
      {/* ======================================================== */}
      <div className="pt-2 border-t-[1.5px] border-[#292225]/15 z-20">
        <div className="flex justify-between items-baseline mb-1">
          <div>
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              {goalTitle}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-sm font-extrabold text-[#292225]">
                ₹{currentAmount.toLocaleString()}
              </span>
              <span className="font-label-caps text-[11px] text-[#552139]/70 font-semibold">
                / ₹{targetAmount.toLocaleString()} target
              </span>
            </div>
          </div>
          <div className="text-right">
            {isGoalReached ? (
              <span className="font-label-caps text-[10px] bg-[#E94355] text-white px-2.5 py-1 rounded font-extrabold uppercase animate-pulse shadow-[1px_1px_0_#292225] inline-flex items-center gap-1">
                <span>Goal Vaulted! 🎯</span>
              </span>
            ) : (
              <span className="font-label-caps text-[10px] text-[#E94355] font-bold">
                ₹{Math.max(0, targetAmount - currentAmount).toLocaleString()} needed
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. TACTILE 3D CONTRIBUTION BUTTONS */}
        {/* ======================================================== */}
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleDeposit(100)}
              className="btn-3d btn-3d-yellow flex-1 py-1.5 text-[11px] font-bold"
              title="Deposit ₹100 into jar"
            >
              + ₹100
            </button>
            <button
              type="button"
              onClick={() => handleDeposit(250)}
              className="btn-3d btn-3d-cherry flex-1 py-1.5 text-[11px] font-bold text-white"
              title="Deposit ₹250 into jar"
            >
              + ₹250
            </button>
            <button
              type="button"
              onClick={() => handleDeposit(500)}
              className="btn-3d btn-3d-burgundy flex-1 py-1.5 text-[11px] font-bold text-white"
              title="Deposit ₹500 into jar"
            >
              + ₹500
            </button>
            <button
              type="button"
              onClick={() => setShowCustomAmount(!showCustomAmount)}
              className="px-2 py-1.5 rounded-lg border-[1.5px] border-[#292225] bg-white font-label-caps text-[10px] uppercase font-bold text-[#292225] hover:bg-[#F6DF79] transition-colors"
              title="Enter custom deposit amount"
            >
              {showCustomAmount ? "Close" : "Custom"}
            </button>
          </div>

          {/* Custom Deposit Form */}
          {showCustomAmount && (
            <form
              onSubmit={handleCustomSubmit}
              className="flex items-center gap-1.5 p-2 bg-[#FFF9F1] border border-[#292225] rounded-lg mt-1"
            >
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1.5 text-xs font-bold text-[#292225]">₹</span>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={customAmountStr}
                  onChange={(e) => setCustomAmountStr(e.target.value)}
                  placeholder="250"
                  className="w-full pl-6 pr-2 py-1 bg-white border border-[#292225] rounded text-xs font-bold text-[#292225] focus:outline-none focus:ring-1 focus:ring-[#E94355]"
                />
              </div>
              <button
                type="submit"
                className="btn-3d btn-3d-cherry px-3 py-1 text-xs font-bold text-white"
              >
                Deposit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveMoneyJar;
