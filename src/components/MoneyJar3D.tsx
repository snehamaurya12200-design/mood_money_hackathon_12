import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useTilt3D } from "@/src/hooks/useTilt3D";

interface MoneyJar3DProps {
  savingsAmount: number;
  savingsGoal: number;
  onTopUp: (amount: number) => void;
  className?: string;
}

interface DroppingCoin {
  id: number;
  xOffset: number;
  rotation: number;
}

export function MoneyJar3D({
  savingsAmount,
  savingsGoal,
  onTopUp,
  className = "",
}: MoneyJar3DProps) {
  const [droppingCoins, setDroppingCoins] = useState<DroppingCoin[]>([]);
  const [isJiggling, setIsJiggling] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmountStr, setCustomAmountStr] = useState("300");
  const [justCelebrated, setJustCelebrated] = useState(false);

  const { ref, tiltProps } = useTilt3D<HTMLDivElement>({ maxTilt: 6, scale: 1.01 });

  const progressPct = Math.min(100, Math.round((savingsAmount / savingsGoal) * 100));
  const isGoalReached = savingsAmount >= savingsGoal;

  // Dynamically calculate visible coins inside the jar proportional to progress (3 to 22 coins)
  const maxCoins = 22;
  const minCoins = 3;
  const coinCount = Math.min(
    maxCoins,
    Math.max(minCoins, Math.round((savingsAmount / savingsGoal) * maxCoins))
  );

  const triggerJarJiggle = () => {
    setIsJiggling(true);
    setTimeout(() => setIsJiggling(false), 500);
  };

  const handleDeposit = (amount: number) => {
    if (amount <= 0) return;

    // Trigger physical coin drop animation
    const coinId = Date.now();
    const xOffset = (Math.random() - 0.5) * 36; // slight horizontal variance
    const rotation = (Math.random() - 0.5) * 60;

    setDroppingCoins((prev) => [...prev, { id: coinId, xOffset, rotation }]);
    setTimeout(() => {
      setDroppingCoins((prev) => prev.filter((c) => c.id !== coinId));
    }, 700);

    // Trigger physical jar jiggle slightly after coin drops
    setTimeout(() => {
      triggerJarJiggle();
    }, 280);

    onTopUp(amount);

    const willReachGoal = savingsAmount + amount >= savingsGoal;
    if (willReachGoal) {
      setJustCelebrated(true);
      setTimeout(() => setJustCelebrated(false), 3000);

      confetti({
        particleCount: 85,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#F6DF79", "#E94355", "#552139", "#FFFFFF", "#F2C6D5"],
      });
    } else {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
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
      className={`relative bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_6px_0px_#292225,0_14px_28px_rgba(41,34,37,0.12)] p-space-md flex flex-col justify-between overflow-hidden select-none transition-all ${
        isGoalReached || justCelebrated
          ? "ring-2 ring-[#F6DF79] ring-offset-2 shadow-[0_6px_0px_#292225,0_0_24px_rgba(246,223,121,0.5)]"
          : ""
      } ${className}`}
    >
      {/* ======================================================== */}
      {/* 1. TOP HEADER & PROGRESS BADGE */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div className="inline-flex items-center gap-1.5 bg-[#FFF9F1] px-2.5 py-1 rounded-full border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225]">
          <span
            className={`w-2 h-2 rounded-full ${
              isGoalReached ? "bg-[#F6DF79] animate-ping" : "bg-[#E94355] animate-pulse"
            }`}
          />
          <span className="font-label-caps text-[10px] sm:text-xs text-[#292225] tracking-widest font-bold uppercase">
            3D Money Jar Vault
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={triggerJarJiggle}
            title="Tap to shake jar"
            className="text-[10px] text-[#552139] hover:text-[#E94355] font-bold underline cursor-pointer"
          >
            Shake Jar 🔔
          </button>
          <span
            className={`font-label-caps text-[10px] px-2 py-0.5 rounded border border-[#292225] font-bold ${
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
        className={`relative my-2 py-3 flex items-center justify-center cursor-pointer perspective-1000 ${
          isJiggling ? "animate-jar-jiggle" : ""
        }`}
        title="Click or tap to inspect and jiggle the money jar!"
      >
        {/* Animated Dropping Coins from Top Slot */}
        {droppingCoins.map((coin) => (
          <div
            key={coin.id}
            style={{
              left: `calc(50% + ${coin.xOffset}px - 14px)`,
              transform: `rotate(${coin.rotation}deg)`,
            }}
            className="absolute top-1 z-40 w-7 h-7 rounded-full bg-gradient-to-tr from-[#bfa531] via-[#F6DF79] to-white border-[1.5px] border-[#292225] shadow-[0_4px_8px_rgba(41,34,37,0.4),0_2px_0_#bfa531] animate-coin-drop flex items-center justify-center font-bold text-[10px] text-[#292225]"
          >
            ₹
          </div>
        ))}

        {/* The 3D Jar Assembly */}
        <div className="relative w-44 sm:w-52 h-56 sm:h-64 flex flex-col items-center preserve-3d">
          {/* Jar Top Faceted Lid Knob */}
          <div className="w-8 h-3.5 rounded-t-lg bg-gradient-to-r from-[#292225] via-[#552139] to-[#292225] border-[1.5px] border-[#292225] shadow-[0_1px_3px_rgba(0,0,0,0.4)] z-30 flex items-center justify-center">
            <span className="w-3 h-0.5 bg-[#F6DF79]/70 rounded-full" />
          </div>

          {/* Cherry-Red Metallic Lid with Extruded Rim */}
          <div className="w-28 sm:w-32 h-6 bg-gradient-to-r from-[#552139] via-[#E94355] to-[#552139] border-[2px] border-[#292225] rounded-t-xl shadow-[0_4px_0px_#292225,inset_0_1px_0_rgba(255,255,255,0.4)] relative z-25 flex items-center justify-center">
            {/* Reflective Coin Slot with Inner Depth */}
            <div className="w-12 h-1.5 bg-[#292225] rounded-full border border-white/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="absolute inset-x-2 top-0 h-[0.5px] bg-[#F6DF79]/60" />
            </div>
          </div>

          {/* Jar Metallic Neck Band (Butter Yellow with Bevel) */}
          <div className="w-24 sm:w-28 h-2.5 bg-gradient-to-r from-[#b89b1c] via-[#F6DF79] to-[#b89b1c] border-x-[2px] border-b-[1.5px] border-[#292225] z-20 shadow-sm flex items-center justify-center">
            <span className="w-full h-[1px] bg-white/40" />
          </div>

          {/* Main Glass Jar Body with Layered Depth & Curvature Highlights */}
          <div className="relative w-36 sm:w-44 flex-1 bg-gradient-to-b from-white/75 via-[#F2C6D5]/25 to-[#FFF9F1]/85 rounded-b-[2.5rem] border-[2px] border-[#292225] shadow-[inset_0_6px_16px_rgba(255,255,255,0.9),inset_0_-10px_20px_rgba(85,33,57,0.18),0_8px_16px_rgba(41,34,37,0.12)] overflow-hidden flex flex-col justify-end p-2 z-10 backdrop-blur-[2px]">
            {/* Glass Curvature Specular Highlight (Left Strip) */}
            <div className="absolute left-2.5 top-2 bottom-6 w-2.5 bg-gradient-to-b from-white/95 via-white/45 to-transparent rounded-full pointer-events-none z-20" />

            {/* Glass Ambient Rim Reflection (Right Strip) */}
            <div className="absolute right-2 top-3 bottom-6 w-1 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full pointer-events-none z-20" />

            {/* Diagonal Specular Glare Sweep Beam */}
            <div className="absolute -right-6 -top-10 w-20 h-56 bg-gradient-to-r from-transparent via-white/35 to-transparent rotate-12 pointer-events-none blur-[1px] z-20 animate-gold-shimmer" />

            {/* Frosted Etched Graduation Ticks & Target Labels */}
            <div className="absolute right-2.5 top-4 bottom-5 flex flex-col justify-between items-end opacity-50 pointer-events-none font-mono text-[8px] text-[#552139] z-20">
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

            {/* Liquid / Resin Savings Fill with 3D Surface Meniscus */}
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#E94355]/30 via-[#F6DF79]/25 to-white/40 transition-all duration-700 ease-out pointer-events-none z-5"
              style={{ height: `${progressPct}%` }}
            >
              {/* Surface Meniscus Wave Line */}
              {progressPct > 4 && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#F6DF79] via-white to-[#F6DF79] border-t border-[#292225]/40 opacity-80 animate-meniscus shadow-[0_0_6px_rgba(246,223,121,0.8)]" />
              )}
            </div>

            {/* Layered Physical Coins Accumulation in 3D Stack */}
            <div className="relative z-15 w-full flex flex-wrap-reverse justify-center items-end gap-1.5 pb-2">
              {Array.from({ length: coinCount }).map((_, index) => {
                const rotationDeg = (index * 43) % 64 - 32;
                const translateYPx = index % 3 === 0 ? -1 : index % 2 === 0 ? 0 : -3;
                return (
                  <div
                    key={index}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#bfa531] via-[#F6DF79] to-white border-[1.5px] border-[#292225] shadow-[0_2.5px_0_#bfa531,0_4px_6px_rgba(41,34,37,0.35),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-center font-bold text-[10px] text-[#292225] transition-transform duration-300 hover:scale-115 cursor-pointer"
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

          {/* Wooden / Ceramic Display Stand Pedestal with 3D Bevel & Contact Shadow */}
          <div className="w-40 sm:w-48 h-4.5 bg-gradient-to-r from-[#b89b1c] via-[#F6DF79] to-[#b89b1c] border-[2px] border-[#292225] rounded-full shadow-[0_6px_0px_#292225,0_12px_24px_rgba(41,34,37,0.3)] mt-1 relative z-5 flex items-center justify-center">
            <span className="w-32 h-[1px] bg-white/50" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BALANCE METRICS & GOAL STATUS */}
      {/* ======================================================== */}
      <div className="pt-2 border-t-[1.5px] border-[#292225]/15">
        <div className="flex justify-between items-baseline mb-1">
          <div>
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Emergency Cushion Vault
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-sm font-extrabold text-[#292225]">
                ₹{savingsAmount.toLocaleString()}
              </span>
              <span className="font-label-caps text-[11px] text-[#552139]/70 font-semibold">
                / ₹{savingsGoal.toLocaleString()} target
              </span>
            </div>
          </div>

          <div className="text-right">
            {isGoalReached ? (
              <span className="font-label-caps text-[10px] bg-[#E94355] text-white px-2.5 py-1 rounded font-extrabold uppercase animate-pulse shadow-[1px_1px_0_#292225] inline-flex items-center gap-1">
                <span>Goal Reached! 🏆</span>
              </span>
            ) : (
              <span className="font-label-caps text-[10px] text-[#E94355] font-bold">
                ₹{Math.max(0, savingsGoal - savingsAmount).toLocaleString()} needed
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. TACTILE 3D TOP-UP CONTROLS */}
        {/* ======================================================== */}
        <div className="space-y-1.5 mt-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleDeposit(100)}
              className="btn-3d btn-3d-yellow flex-1 py-1.5 text-[11px] font-bold"
            >
              + ₹100
            </button>
            <button
              type="button"
              onClick={() => handleDeposit(200)}
              className="btn-3d btn-3d-cherry flex-1 py-1.5 text-[11px] font-bold text-white"
            >
              + ₹200
            </button>
            <button
              type="button"
              onClick={() => handleDeposit(500)}
              className="btn-3d btn-3d-burgundy flex-1 py-1.5 text-[11px] font-bold text-white"
            >
              + ₹500
            </button>
            <button
              type="button"
              onClick={() => setShowCustomAmount(!showCustomAmount)}
              className="px-2 py-1.5 rounded-lg border-[1.5px] border-[#292225] bg-white font-label-caps text-[10px] uppercase font-bold text-[#292225] hover:bg-[#F6DF79] transition-colors"
              title="Enter custom top-up amount"
            >
              {showCustomAmount ? "Close" : "Custom"}
            </button>
          </div>

          {/* Optional Custom Contribution Tray */}
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
                  placeholder="300"
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

export default MoneyJar3D;
