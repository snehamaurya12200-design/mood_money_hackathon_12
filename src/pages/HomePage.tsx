import React, { useState } from "react";
import WarpGradient, { MOOD_MONEY_WARP_CONFIG } from "@/src/components/ui/warp-gradient";
import EditorialMarquee from "@/src/components/EditorialMarquee";
import MoneyJar3D from "@/src/components/MoneyJar3D";
import MoneyverseScene from "@/src/components/MoneyverseScene";
import Journey30Days from "@/src/components/Journey30Days";
import SpendingForecast from "@/src/components/SpendingForecast";
import FinancialHealthOrb from "@/src/components/FinancialHealthOrb";
import { useTilt3D } from "@/src/hooks/useTilt3D";
import { useFinance } from "@/src/context/FinanceContext";
import type { NavDestination } from "@/src/components/NavigationSidebar";

interface HomePageProps {
  onNavigate: (dest: NavDestination) => void;
  onOpenAffordModal: () => void;
  onOpenQuickAdd: () => void;
}

export function HomePage({ onNavigate, onOpenAffordModal, onOpenQuickAdd }: HomePageProps) {
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
    savingsGoals,
    topUpSavingsGoal,
    transactions,
  } = useFinance();

  const [heroArtMode, setHeroArtMode] = useState<"jar" | "piggy">("jar");

  const activeEmergencyGoal =
    savingsGoals.find((g) => g.id === "goal-1") || savingsGoals[0] || {
      id: "goal-1",
      currentAmount: 1200,
      targetAmount: 2000,
    };

  const { ref: decisionCardRef, tiltProps: decisionTiltProps } = useTilt3D<HTMLElement>({
    maxTilt: 4,
    scale: 1.005,
  });

  const { ref: piggyRef, tiltProps: piggyTiltProps } = useTilt3D<HTMLDivElement>({
    maxTilt: 7,
    scale: 1.01,
  });

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* ======================================================== */}
      {/* SECTION 1: MAIN HERO — THE MONEY STATEMENT */}
      {/* ======================================================== */}
      <div className="relative isolate overflow-hidden rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_6px_0px_#292225,0_12px_24px_rgba(41,34,37,0.12)] p-space-lg sm:p-space-xl">
        {/* WebGL2 Cherry Cola Warp Gradient Canvas (Liquid Satin Flow) */}
        <WarpGradient
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          colors={["#552139", "#E94355", "#F2C6D5", "#FFF9F1"]}
          pattern="bands"
          density={0.3}
          softness={0.9}
          warp={0.65}
          turbulence={0.15}
          scale={0.55}
          rotation={-25}
          speed={0.2}
          grain={0.12}
          glossyHighlights={true}
          vignette={true}
          satinSheen={true}
        />

        {/* Soft editorial cream veil for crisp text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#FFF9F1]/72 backdrop-blur-[0.5px] pointer-events-none z-[2]"
        />

        {/* Foreground Content */}
        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-stretch">
          {/* Left Column: Editorial Balance Statement & Metrics (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-space-xs mb-space-sm">
                <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border-[1px] border-[#292225] shadow-[1px_1px_0px_#292225]" />
                <span className="font-label-caps text-label-caps text-[#552139] font-bold tracking-widest uppercase">
                  YOUR MONTH. YOUR RULES.
                </span>
              </div>

              {/* Bold Editorial Headline */}
              <h1 className="font-display-hero text-display-hero text-[#292225] tracking-tight leading-[0.95] mb-space-md">
                ₹10,000. 30 days.
                <br />
                <span className="text-[#E94355] underline decoration-[#F6DF79] decoration-4 underline-offset-8">
                  Let&apos;s make it.
                </span>
              </h1>
              <p className="font-body-lg text-body-lg text-[#5a4040] max-w-xl mb-space-xl">
                Your money has places to go. Let&apos;s decide which ones matter before impulsive
                friction takes the lead.
              </p>

              {/* Financial Balance Block with 3D Depth */}
              <div className="bg-white p-space-lg rounded-xl border-[2px] border-[#292225] border-b-[4px] border-b-[#552139] shadow-[0_4px_0px_#292225,0_8px_16px_rgba(41,34,37,0.08)] relative overflow-hidden mb-space-lg">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-xs pb-space-sm border-b-[1.5px] border-[#292225]/10">
                  <span className="font-label-caps text-label-caps text-[#292225]/70 uppercase tracking-widest font-bold">
                    Available Balance
                  </span>
                  <span className="font-label-caps text-label-caps text-[#E94355] uppercase font-bold bg-[#f8eaee] px-2 py-0.5 rounded border border-[#292225]/20">
                    ₹{totalSpent.toLocaleString()} spent so far
                  </span>
                </div>
                <div className="mt-space-md flex flex-wrap items-baseline gap-x-space-md gap-y-1">
                  <span className="font-display-hero text-display-hero text-[#292225] font-extrabold tracking-tight">
                    ₹{availableBalance.toLocaleString()}
                  </span>
                  <span className="font-label-numeric-md text-label-numeric-md text-[#552139]/60 font-medium">
                    / {startingBudget.toLocaleString()} INR
                  </span>
                </div>

                {/* 30-Day Progress Bar Section */}
                <div className="mt-space-lg pt-space-md border-t-[1.5px] border-[#292225]/10">
                  <div className="flex items-center justify-between mb-space-xs">
                    <div className="inline-flex items-center gap-space-xs bg-[#F6DF79] px-space-sm py-0.5 rounded-full border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225]">
                      <span className="font-label-caps text-label-caps text-[#292225] font-bold uppercase tracking-wider">
                        Day {currentDay} of {totalDays}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E94355] animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-[#E94355] -ml-3.5" />
                      <span className="font-label-caps text-label-caps text-[#552139] uppercase font-semibold">
                        Budget survival mode: ON
                      </span>
                    </div>
                  </div>
                  {/* Dual-color Segmented Bar */}
                  <div className="w-full h-4 bg-[#f8eaee] rounded-full border-[1.5px] border-[#292225] p-[2px] overflow-hidden flex shadow-inner">
                    <div
                      className="h-full bg-[#E94355] rounded-l-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${Math.min(100, Math.round((totalSpent / startingBudget) * 100))}%`,
                      }}
                    />
                    <div
                      className="h-full bg-[#F6DF79] transition-all duration-500"
                      style={{ width: "8%" }}
                    />
                    <div
                      className="h-full bg-[#e4d7db]/40 rounded-r-full"
                      style={{
                        width: `${Math.max(
                          0,
                          100 - Math.round((totalSpent / startingBudget) * 100) - 8
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-label-caps text-[10px] text-[#292225]/60 uppercase font-bold">
                      Day 01
                    </span>
                    <span className="font-label-caps text-[10px] text-[#E94355] font-bold uppercase">
                      {Math.round((currentDay / totalDays) * 100)}% Cycle Elapsed
                    </span>
                    <span className="font-label-caps text-[10px] text-[#292225]/60 uppercase font-bold">
                      Day {totalDays}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Health Orb Component */}
            <FinancialHealthOrb
              spentSoFar={totalSpent}
              initialBudget={startingBudget}
              currentDay={currentDay}
              totalDays={totalDays}
              essentialCommitments={essentialCommitments}
            />
          </div>

          {/* Right Column: 3D Money Jar / Ceramic Piggy Bank Toggle */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* Display Switcher */}
            <div className="flex items-center justify-end gap-1.5 mb-2">
              <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold mr-1">
                Display Mode:
              </span>
              <button
                type="button"
                onClick={() => setHeroArtMode("jar")}
                className={`px-2 py-0.5 font-label-caps text-[10px] uppercase font-bold rounded border border-[#292225] transition-all cursor-pointer ${
                  heroArtMode === "jar"
                    ? "bg-[#292225] text-white shadow-[1px_1px_0px_#292225]"
                    : "bg-white text-[#292225] hover:bg-[#F6DF79]"
                }`}
              >
                3D Money Jar
              </button>
              <button
                type="button"
                onClick={() => setHeroArtMode("piggy")}
                className={`px-2 py-0.5 font-label-caps text-[10px] uppercase font-bold rounded border border-[#292225] transition-all cursor-pointer ${
                  heroArtMode === "piggy"
                    ? "bg-[#292225] text-white shadow-[1px_1px_0px_#292225]"
                    : "bg-white text-[#292225] hover:bg-[#F6DF79]"
                }`}
              >
                FIG. 02 Piggy
              </button>
            </div>

            {heroArtMode === "jar" ? (
              <MoneyJar3D
                savingsAmount={activeEmergencyGoal.currentAmount}
                savingsGoal={activeEmergencyGoal.targetAmount}
                onTopUp={(amt) => topUpSavingsGoal(activeEmergencyGoal.id, amt)}
                className="h-full"
              />
            ) : (
              <div
                ref={piggyRef}
                {...piggyTiltProps}
                className="relative w-full h-full min-h-[440px] bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225,0_10px_20px_rgba(41,34,37,0.1)] p-space-md flex flex-col justify-between overflow-hidden group select-none"
              >
                <div className="flex items-center justify-between z-10">
                  <div className="inline-flex items-center gap-space-xs bg-[#FFF9F1]/95 backdrop-blur-sm px-space-sm py-space-xs rounded-full border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225]">
                    <span className="w-2 h-2 rounded-full bg-[#E94355]" />
                    <span className="font-label-caps text-label-caps text-[#292225] tracking-widest font-bold uppercase">
                      Your Money Universe
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-[#552139] bg-[#F6DF79]/90 px-space-xs py-0.5 rounded border border-[#292225] font-semibold">
                    FIG. 02
                  </span>
                </div>

                <div className="my-auto py-space-md flex items-center justify-center relative">
                  <div className="w-full aspect-square max-w-[340px] relative rounded-xl overflow-hidden border-[1.5px] border-[#292225] shadow-[3px_3px_0px_#292225] bg-[#FFF9F1]">
                    <img
                      alt="A sculptural cherry-red ceramic piggy bank on a butter-yellow pedestal"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSnjXoA0_ZD9mR8rYp47PeBOeRr419dvIa_4ODIcoMC9RwZWbZm7JwXVW_BkYuzoLwaHiFJHdMbbCJgBsR72pMJ-o2qGAvm8wVkTeRf0ODix2gB1wEcMQa7jozwucDZP2cVcOqWk9iFkMRHDvpgFkYCBK__TSdSETUG130REjDQpMw7KsLnNa1RmGNo9hKwS9crPB1dnbs24QJ3Ft3yM2_AE_Wz3E5uieHM0Bj8LAUZuIxcyZWPtq_"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#292225]/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="z-10 pt-space-sm border-t-[1.5px] border-[#292225]/15 flex items-center justify-between text-[#292225]">
                  <div>
                    <p className="font-label-caps text-label-caps text-[#552139] uppercase font-semibold">
                      Vault State
                    </p>
                    <p className="font-body-sm text-body-sm font-bold">Unbroken • Disciplined</p>
                  </div>
                  <div className="text-right">
                    <p className="font-label-caps text-label-caps text-[#552139] uppercase font-semibold">
                      Reserve Ratio
                    </p>
                    <p className="font-body-sm text-body-sm font-bold text-[#E94355]">
                      {((availableBalance / startingBudget) * 100).toFixed(1)}% Retention
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: FINANCIAL SNAPSHOT (EDITORIAL THREE PANELS) */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-stretch">
        {/* PANEL A — SAFE TO SPEND */}
        <div className="md:col-span-4 bg-[#F6DF79] rounded-xl border-[2px] border-[#292225] border-b-[4px] border-b-[#b89b1c] shadow-[0_4px_0px_#292225,0_6px_12px_rgba(41,34,37,0.08)] p-space-lg flex flex-col justify-between relative overflow-hidden transition-all hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-[#292225] font-bold uppercase tracking-wider bg-white/80 px-space-xs py-0.5 rounded border border-[#292225]">
              Panel 01
            </span>
            <span className="material-symbols-outlined text-[#292225] text-[22px]">verified</span>
          </div>
          <div className="my-space-md">
            <p className="font-label-caps text-label-caps text-[#292225]/80 uppercase tracking-widest font-semibold mb-1">
              Safe to Spend Today
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-lg text-[#292225] font-extrabold tracking-tight">
                ₹{dayCap}
              </span>
              <span className="font-label-caps text-label-caps text-[#552139] uppercase font-semibold">
                / Day cap
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-[#292225]/90 mt-space-xs">
              Suggested daily spending limit to finish month {totalDays} without strain.
            </p>
          </div>
          <div className="pt-space-sm border-t-[1.5px] border-[#292225]/20 flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-caps text-[11px] text-[#292225] uppercase font-bold">
                ₹{todayConsumed} consumed today
              </span>
            </div>
            <span className="font-label-caps text-[11px] text-[#552139] font-bold">
              ₹{todayLeft} left
            </span>
          </div>
        </div>

        {/* PANEL B — SAVINGS (EMERGENCY CUSHION) */}
        <div className="md:col-span-4 bg-white rounded-xl border-[2px] border-[#292225] border-b-[4px] border-b-[#8e7070] shadow-[0_4px_0px_#292225,0_6px_12px_rgba(41,34,37,0.08)] p-space-lg flex flex-col justify-between transition-all hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-[#292225] font-bold uppercase tracking-wider bg-[#f8eaee] px-space-xs py-0.5 rounded border border-[#292225]/40">
              Panel 02
            </span>
            <span
              className="material-symbols-outlined text-[#E94355] text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
          </div>
          <div className="my-space-md">
            <p className="font-label-caps text-label-caps text-[#552139]/80 uppercase tracking-widest font-semibold mb-1">
              Emergency Cushion
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-lg text-[#292225] font-extrabold tracking-tight">
                ₹{activeEmergencyGoal.currentAmount.toLocaleString()}
              </span>
              <span className="font-body-md text-body-md text-[#292225]/60 font-semibold">
                / ₹{activeEmergencyGoal.targetAmount.toLocaleString()}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-[#5a4040] mt-space-xs">
              Guaranteed cushion locked before weekend expenses unlock.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-label-caps text-label-caps text-[#E94355] font-bold uppercase">
                {Math.round(
                  (activeEmergencyGoal.currentAmount / activeEmergencyGoal.targetAmount) * 100
                )}
                % of your goal
              </span>
              <span className="font-label-caps text-label-caps text-[#292225]/60">
                ₹{Math.max(0, activeEmergencyGoal.targetAmount - activeEmergencyGoal.currentAmount)} to go
              </span>
            </div>
            <div className="w-full h-3 bg-[#f8eaee] rounded-full border-[1.5px] border-[#292225] p-[1px] overflow-hidden">
              <div
                className="h-full bg-[#E94355] rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (activeEmergencyGoal.currentAmount / activeEmergencyGoal.targetAmount) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <div className="mt-space-md pt-space-xs flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate("savings-lab")}
                className="inline-flex items-center gap-1 font-label-caps text-label-caps text-[#292225] hover:text-[#E94355] uppercase font-bold transition-colors cursor-pointer"
              >
                <span>Savings Lab</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* PANEL C — UPCOMING COMMITMENTS */}
        <div className="md:col-span-4 bg-[#F2C6D5] rounded-xl border-[2px] border-[#292225] border-b-[4px] border-b-[#884b65] shadow-[0_4px_0px_#292225,0_6px_12px_rgba(41,34,37,0.08)] p-space-lg flex flex-col justify-between transition-all hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-[#292225] font-bold uppercase tracking-wider bg-white/80 px-space-xs py-0.5 rounded border border-[#292225]">
              Panel 03
            </span>
            <span className="material-symbols-outlined text-[#292225] text-[22px]">calendar_month</span>
          </div>
          <div className="mt-space-sm mb-space-md">
            <p className="font-label-caps text-label-caps text-[#552139] uppercase tracking-widest font-bold mb-space-xs">
              Coming Up
            </p>
            <div className="space-y-space-sm">
              <div className="bg-white/90 border-[1.5px] border-[#292225] rounded-lg p-space-sm flex items-center justify-between shadow-[2px_2px_0px_#292225]">
                <div>
                  <p className="font-body-md text-body-md font-bold text-[#292225] leading-tight">
                    Mobile recharge
                  </p>
                  <p className="font-label-numeric-md text-label-numeric-md font-bold text-[#E94355]">
                    ₹299
                  </p>
                </div>
                <span className="font-label-caps text-[10px] text-[#292225] uppercase font-bold bg-[#F6DF79] px-space-xs py-1 rounded-full border border-[#292225]">
                  Due in 3 days
                </span>
              </div>
              <div className="bg-white/90 border-[1.5px] border-[#292225] rounded-lg p-space-sm flex items-center justify-between shadow-[2px_2px_0px_#292225]">
                <div>
                  <p className="font-body-md text-body-md font-bold text-[#292225] leading-tight">
                    Subscription
                  </p>
                  <p className="font-label-numeric-md text-label-numeric-md font-bold text-[#292225]">
                    ₹551
                  </p>
                </div>
                <span className="font-label-caps text-[10px] text-[#292225] uppercase font-bold bg-white px-space-xs py-1 rounded-full border border-[#292225]">
                  Due in 6 days
                </span>
              </div>
            </div>
          </div>
          <div className="pt-space-xs flex items-center justify-between text-[#552139]">
            <span className="font-label-caps text-[11px] uppercase font-semibold">Total Scheduled</span>
            <span className="font-label-caps text-[11px] uppercase font-bold">
              ₹{essentialCommitments} Pre-Allocated
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: THE MONEYVERSE (3D Interactive Three.js Diorama) */}
      {/* ======================================================== */}
      <MoneyverseScene
        onNavigateToSavings={() => onNavigate("savings-lab")}
        onNavigateToChallenge={() => onNavigate("challenge-hq")}
      />

      {/* 30-Day Journey Preview */}
      <Journey30Days
        currentDay={currentDay}
        totalDays={totalDays}
        spentSoFar={totalSpent}
        todayConsumed={todayConsumed}
        dayCap={dayCap}
        availableBalance={availableBalance}
      />

      {/* Dynamic Spending Forecast Preview */}
      <SpendingForecast
        currentDay={currentDay}
        totalDays={totalDays}
        spentSoFar={totalSpent}
        initialBudget={startingBudget}
        essentialCommitments={essentialCommitments}
      />

      {/* Moving Typography Marquee */}
      <EditorialMarquee />

      {/* Decision Studio CTA Banner */}
      <section
        ref={decisionCardRef}
        {...decisionTiltProps}
        className="w-full relative isolate overflow-hidden rounded-2xl border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] shadow-[0_6px_0px_#292225,0_14px_28px_rgba(41,34,37,0.18)] p-space-xl text-white"
      >
        <WarpGradient
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          colors={["#552139", "#E94355", "#F2C6D5", "#FFF9F1"]}
          pattern="bands"
          density={0.28}
          softness={0.9}
          warp={0.55}
          speed={0.18}
          grain={0.1}
          glossyHighlights={true}
          vignette={true}
          satinSheen={true}
        />
        {/* Soft deep cherry wash for crisp white typography contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#552139]/85 via-[#552139]/70 to-[#E94355]/60 pointer-events-none z-[2]"
        />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-space-xs mb-space-sm">
            <span className="material-symbols-outlined text-[#F6DF79] text-[20px]">spark</span>
            <span className="font-label-caps text-label-caps text-[#F6DF79] font-bold uppercase tracking-widest">
              Before You Spend
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F6DF79]" />
            <span className="font-label-caps text-label-caps text-white/80 uppercase">
              The Decision Studio
            </span>
          </div>

          <h2 className="font-headline-lg text-headline-lg md:text-[44px] md:leading-[48px] text-white font-extrabold tracking-tight mb-space-sm">
            Want it? Run the numbers.
          </h2>

          <p className="font-body-lg text-body-lg text-white/90 max-w-xl mb-space-lg">
            Try the decision before your money takes the hit. Stress-test impulsive additions against
            your safe-to-spend cadence, pre-allocated bills (₹{essentialCommitments}), and runway days.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-space-lg">
            <button
              className="btn-3d btn-3d-yellow px-space-xl py-3.5 text-sm sm:text-base flex items-center justify-center gap-space-sm"
              onClick={onOpenAffordModal}
              type="button"
            >
              <span>Can I afford it?</span>
              <span className="material-symbols-outlined font-bold text-[22px]">arrow_forward</span>
            </button>
            <button
              onClick={() => onNavigate("can-i-afford-it")}
              className="text-xs uppercase font-label-caps font-bold text-[#F6DF79] underline underline-offset-4 hover:text-white"
            >
              Open Full Studio Simulator →
            </button>
          </div>
        </div>
      </section>

      {/* Recent Activity Ledger Preview */}
      <section className="bg-white rounded-xl border-[2px] border-[#292225] border-b-[4px] border-b-[#8e7070] shadow-[0_4px_0px_#292225] p-space-lg w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md border-b-[1.5px] border-[#292225]/15 gap-space-sm">
          <div className="flex items-baseline gap-space-md">
            <h3 className="font-headline-md text-headline-md text-[#292225] font-bold tracking-tight">
              Where it went.
            </h3>
            <span className="font-label-caps text-label-caps text-[#552139] uppercase font-semibold">
              Recent Ledger Entries
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("my-money")}
            className="inline-flex items-center gap-1 font-body-sm text-body-sm font-bold text-[#292225] hover:text-[#E94355] transition-colors underline decoration-[#292225]/30 underline-offset-4 cursor-pointer"
          >
            <span>View all transactions ({transactions.length})</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="divide-y-[1.5px] divide-[#292225]/10">
          {transactions.slice(0, 4).map((tx) => (
            <div
              key={tx.id}
              className="py-space-md flex items-center justify-between hover:bg-[#FFF9F1]/60 transition-colors px-space-xs rounded-lg"
            >
              <div className="flex items-center gap-space-md">
                <div
                  className={`w-11 h-11 rounded-DEFAULT ${tx.iconBg || "bg-[#F6DF79]"} border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] flex items-center justify-center text-[#292225] flex-shrink-0`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tx.icon || "receipt"}</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-body-md text-body-md font-bold text-[#292225]">
                      {tx.name}
                    </span>
                    <span className="font-label-caps text-[10px] text-[#292225] uppercase bg-[#f8eaee] px-1.5 py-0.5 rounded border border-[#292225]/30">
                      {tx.merchant || tx.category}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-[#5a4040]">
                    {tx.date} • {tx.note || tx.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline-sm text-headline-sm font-bold text-[#E94355] tracking-tight">
                  −₹{tx.amount}
                </span>
                <p className="font-label-caps text-[10px] text-[#292225]/60 uppercase">Settled</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-space-md pt-space-md border-t-[1.5px] border-[#292225]/15 flex flex-col sm:flex-row items-center justify-between gap-space-md bg-[#FFF9F1] p-space-md rounded-lg border-[1.5px] border-dashed border-[#292225]/40">
          <div className="flex items-center gap-space-sm text-[#292225]">
            <span className="material-symbols-outlined text-[#E94355]">edit_note</span>
            <span className="font-body-sm text-body-sm font-medium">
              Logged a spontaneous purchase outside the flow?
            </span>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="btn-3d btn-3d-white px-space-md py-2 text-xs font-bold"
            type="button"
          >
            + Record Quick Entry
          </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
