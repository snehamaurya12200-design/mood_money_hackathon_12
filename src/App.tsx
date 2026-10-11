/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FinanceProvider, useFinance } from "@/src/context/FinanceContext";
import NavigationSidebar, { type NavDestination } from "@/src/components/NavigationSidebar";
import QuickEntryModal from "@/src/components/QuickEntryModal";
import AffordSimulatorModal from "@/src/components/AffordSimulatorModal";
import WarpGradient from "@/src/components/ui/warp-gradient";

// 8 Multi-Page Destinations
import HomePage from "@/src/pages/HomePage";
import MyMoneyPage from "@/src/pages/MyMoneyPage";
import SpendPlannerPage from "@/src/pages/SpendPlannerPage";
import CanIAffordItPage from "@/src/pages/CanIAffordItPage";
import SavingsLabPage from "@/src/pages/SavingsLabPage";
import FutureMePage from "@/src/pages/FutureMePage";
import MoneyPersonalityPage from "@/src/pages/MoneyPersonalityPage";
import ChallengeHQPage from "@/src/pages/ChallengeHQPage";

function MainAppContent() {
  const {
    availableBalance,
    currentDay,
    totalDays,
    essentialCommitments,
    commitments,
    todayConsumed,
    dayCap,
    todayLeft,
    savingsGoals,
    addTransaction,
  } = useFinance();

  const [currentDestination, setCurrentDestination] = useState<NavDestination>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAffordModal, setShowAffordModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [atmosphereMode, setAtmosphereMode] = useState<"fluid" | "calm">("fluid");

  // Active emergency cushion
  const activeEmergency = savingsGoals[0] || { currentAmount: 1200, targetAmount: 2000 };

  const handleNavigate = (dest: NavDestination) => {
    setCurrentDestination(dest);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageTitle = (dest: NavDestination) => {
    switch (dest) {
      case "home":
        return "Command Center";
      case "my-money":
        return "My Money & Ledger";
      case "spend-planner":
        return "Spend Planner";
      case "can-i-afford-it":
        return "Can I Afford It? Studio";
      case "savings-lab":
        return "Savings Lab";
      case "future-me":
        return "Future Me Forecast";
      case "money-personality":
        return "Money Personality";
      case "challenge-hq":
        return "Challenge HQ (Day 12)";
      default:
        return "Mood Money";
    }
  };

  return (
    <div className="bg-[#FFF9F1] font-body-md text-[#201a1d] min-h-screen antialiased flex selection:bg-[#E94355] selection:text-white relative overflow-x-hidden">
      {/* 0. AMBIENT 3D CHERRY COLA WARP GRADIENT BACKGROUND */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <WarpGradient
          className="w-full h-full object-cover"
          colors={["#552139", "#E94355", "#F2C6D5", "#FFF9F1"]}
          pattern="bands"
          density={0.22}
          softness={0.92}
          warp={0.7}
          turbulence={0.14}
          scale={0.48}
          rotation={-22}
          speed={atmosphereMode === "fluid" ? 0.14 : 0.04}
          grain={0.06}
          glossyHighlights={true}
          satinSheen={true}
          vignette={true}
          interactiveMouse={true}
        />
        {/* Editorial Warm Cream Veil: allows the liquid waves to glow softly through gutters and margins without overwhelming text readability */}
        <div className="absolute inset-0 bg-[#FFF9F1]/82 backdrop-blur-[1px] pointer-events-none" />
      </div>

      {/* 1. MAIN NAVIGATION SIDEBAR (Desktop Fixed & Mobile Drawer) */}
      <NavigationSidebar
        currentDestination={currentDestination}
        onNavigate={handleNavigate}
        onOpenQuickAdd={() => setShowQuickAdd(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
        {/* TOP EDITORIAL APP HEADER (Desktop & Tablet) */}
        <header className="sticky top-0 z-30 bg-[#FFF9F1]/95 backdrop-blur-md border-b-[2px] border-[#292225] shadow-[0_2px_0px_#292225] px-4 sm:px-8 py-3.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-white border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225] flex items-center justify-center text-[#292225] cursor-pointer"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            {/* Breadcrumb info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold tracking-wider">
                  Mood Money • 30-Day Survival Challenge
                </span>
                <span className="hidden sm:inline-block text-[#552139]/40">•</span>
                <span className="hidden sm:inline-block font-label-caps text-[10px] bg-[#F6DF79] text-[#292225] px-2 py-0.5 rounded border border-[#292225] font-bold">
                  ₹10,000 Cap
                </span>
              </div>
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-[#292225] uppercase tracking-tight">
                {getPageTitle(currentDestination)}
              </h2>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Liquid Atmosphere Mode Toggle */}
            <button
              type="button"
              onClick={() => setAtmosphereMode(atmosphereMode === "fluid" ? "calm" : "fluid")}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225] text-xs font-bold text-[#552139] hover:bg-[#F2C6D5]/30 transition-colors cursor-pointer"
              title="Toggle Liquid Cherry Warp Atmosphere flow speed"
            >
              <span className={`w-2 h-2 rounded-full bg-[#E94355] ${atmosphereMode === "fluid" ? "animate-pulse" : ""}`} />
              <span className="font-label-caps text-[10px] uppercase">
                {atmosphereMode === "fluid" ? "Warp Atmosphere: Fluid" : "Warp Atmosphere: Calm"}
              </span>
            </button>

            {/* Quick Record Button */}
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="btn-3d btn-3d-yellow hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Record Entry</span>
            </button>

            {/* Decision Assistant Trigger */}
            <button
              type="button"
              onClick={() => setShowAffordModal(true)}
              className="btn-3d btn-3d-cherry flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white"
              title="Can I afford it? Simulator"
            >
              <span className="material-symbols-outlined text-[17px]">psychology</span>
              <span className="hidden md:inline">Can I Afford It?</span>
            </button>

            {/* Notifications Toggle */}
            <button
              type="button"
              aria-label="Toggle notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-lg bg-white border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] flex items-center justify-center text-[#292225] hover:bg-[#F2C6D5]/40 transition-colors cursor-pointer relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E94355] rounded-full border border-[#292225]" />
            </button>
          </div>
        </header>

        {/* NOTIFICATIONS SLIDE-OVER DRAWER */}
        <AnimatePresence>
          {showNotifications && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative z-10 w-full max-w-sm bg-[#FFF9F1] border-l-[3px] border-[#292225] shadow-[-6px_0_0_#292225] h-full overflow-y-auto p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b-[1.5px] border-[#292225]/20 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#E94355]">notifications_active</span>
                      <h3 className="font-headline-sm text-base font-bold text-[#292225]">
                        Ritual Alerts &amp; Commitments
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="w-7 h-7 rounded-full bg-white border border-[#292225] flex items-center justify-center text-xs font-bold hover:bg-[#E94355] hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Alert 1: Daily Pace */}
                    <div className="p-3 bg-white border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-caps text-[10px] text-[#292225] font-bold uppercase bg-[#F6DF79] px-1.5 py-0.5 rounded border border-[#292225]">
                          Daily Allowance
                        </span>
                        <span className="text-[10px] text-[#552139] font-bold">Day {currentDay}/30</span>
                      </div>
                      <p className="font-bold text-xs text-[#292225]">
                        ₹{todayConsumed} consumed of ₹{dayCap} cap today
                      </p>
                      <p className="text-[11px] text-[#5a4040] mt-0.5">
                        ₹{todayLeft} remains for tonight. Keep momentum steady!
                      </p>
                    </div>

                    {/* Alert 2 & 3: Commitments */}
                    {commitments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 bg-[#F2C6D5]/40 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-label-caps text-[10px] text-[#552139] font-bold uppercase">
                            Upcoming Bill
                          </span>
                          <span className="text-[10px] font-bold text-[#E94355]">
                            Due Day {comm.dueDay} (in {Math.max(0, comm.dueDay - currentDay)} days)
                          </span>
                        </div>
                        <p className="font-bold text-xs text-[#292225]">{comm.title}</p>
                        <p className="font-headline-sm text-xs font-extrabold text-[#E94355] mt-0.5">
                          ₹{comm.amount} Pre-Allocated
                        </p>
                      </div>
                    ))}

                    {/* Alert 4: Cushion Status */}
                    <div className="p-3 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-caps text-[10px] text-[#552139] font-bold uppercase">
                          Emergency Fortress
                        </span>
                        <span className="text-[10px] font-bold text-[#292225]">
                          {Math.round((activeEmergency.currentAmount / activeEmergency.targetAmount) * 100)}%
                        </span>
                      </div>
                      <p className="font-bold text-xs text-[#292225]">
                        ₹{activeEmergency.currentAmount.toLocaleString()} safely vaulted
                      </p>
                      <p className="text-[11px] text-[#5a4040] mt-0.5">
                        Zero unauthorized drawdowns recorded.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#292225]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      handleNavigate("challenge-hq");
                    }}
                    className="btn-3d btn-3d-yellow w-full py-2.5 text-xs font-bold"
                  >
                    View Challenge HQ Matrix →
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. DYNAMIC MULTI-PAGE ROUTE RENDERER */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDestination}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {currentDestination === "home" && (
                <HomePage
                  onNavigate={handleNavigate}
                  onOpenAffordModal={() => setShowAffordModal(true)}
                  onOpenQuickAdd={() => setShowQuickAdd(true)}
                />
              )}

              {currentDestination === "my-money" && <MyMoneyPage />}

              {currentDestination === "spend-planner" && <SpendPlannerPage />}

              {currentDestination === "can-i-afford-it" && <CanIAffordItPage />}

              {currentDestination === "savings-lab" && <SavingsLabPage />}

              {currentDestination === "future-me" && <FutureMePage />}

              {currentDestination === "money-personality" && <MoneyPersonalityPage />}

              {currentDestination === "challenge-hq" && <ChallengeHQPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 4. EDITORIAL FOOTER */}
        <footer className="mt-auto border-t-[2px] border-[#292225] bg-[#FFF9F1] px-4 sm:px-8 py-6 select-none">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#E94355] border-[1.5px] border-[#292225] rotate-45 shadow-[1px_1px_0px_#292225]" />
              <span className="font-headline-sm text-sm font-bold uppercase text-[#292225]">
                Mood Money
              </span>
              <span className="text-[#552139]/40">•</span>
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                Survive 30 Days on ₹10,000
              </span>
            </div>

            <p className="font-label-caps text-xs text-[#552139] uppercase font-bold text-center sm:text-right">
              Ritual Cycle 04 • Designed with Cherry Cola Palette &amp; Warp Gradients
            </p>
          </div>
        </footer>
      </div>

      {/* 5. GLOBAL INTERACTIVE MODALS */}
      {/* Quick Entry Modal */}
      <QuickEntryModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />

      {/* Can I Afford It? Simulator Modal */}
      <AffordSimulatorModal
        isOpen={showAffordModal}
        onClose={() => setShowAffordModal(false)}
        availableBalance={availableBalance}
        currentDay={currentDay}
        totalDays={totalDays}
        essentialCommitments={essentialCommitments}
        savingsGoalAmount={activeEmergency.targetAmount}
        onConfirmPurchase={(item) => {
          addTransaction({
            name: item.name,
            amount: item.amount,
            category: (item.category as any) || "Other",
            type: "expense",
            date: `Day ${currentDay} • Just now`,
            dayNumber: currentDay,
            merchant: "Decision Studio Approved",
            note: "Stress-tested purchase",
          });
          setShowAffordModal(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
