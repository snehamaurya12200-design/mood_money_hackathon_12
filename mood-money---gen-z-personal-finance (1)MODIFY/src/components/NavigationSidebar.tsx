import React from "react";
import { useFinance } from "@/src/context/FinanceContext";

export type NavDestination =
  | "home"
  | "my-money"
  | "spend-planner"
  | "can-i-afford-it"
  | "savings-lab"
  | "future-me"
  | "money-personality"
  | "challenge-hq";

interface NavigationProps {
  currentDestination: NavDestination;
  onNavigate: (dest: NavDestination) => void;
  onOpenQuickAdd?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const NAV_ITEMS: { id: NavDestination; label: string; icon: string; badge?: string }[] = [
  { id: "home", label: "Home", icon: "dashboard" },
  { id: "my-money", label: "My Money", icon: "receipt_long" },
  { id: "spend-planner", label: "Spend Planner", icon: "tune" },
  { id: "can-i-afford-it", label: "Can I Afford It?", icon: "psychology" },
  { id: "savings-lab", label: "Savings Lab", icon: "savings" },
  { id: "future-me", label: "Future Me", icon: "query_stats" },
  { id: "money-personality", label: "Personality", icon: "auto_awesome" },
  { id: "challenge-hq", label: "Challenge HQ", icon: "flag", badge: "Day 12" },
];

export function NavigationSidebar({
  currentDestination,
  onNavigate,
  onOpenQuickAdd,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavigationProps) {
  const { availableBalance, currentDay, totalDays } = useFinance();

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible lg and above) */}
      <aside className="hidden lg:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 bg-[#FFF9F1] border-r-[2px] border-[#292225] shadow-[3px_0_0_#292225] z-40 select-none overflow-y-auto">
        {/* Top Brand Anchor */}
        <div>
          <div
            onClick={() => onNavigate("home")}
            className="p-5 border-b-[2px] border-[#292225] bg-[#FFF9F1] flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#E94355] border-[1.5px] border-[#292225] rotate-45 shadow-[1.5px_1.5px_0px_#292225] group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
              <div>
                <span className="font-headline-sm text-lg tracking-tight text-[#292225] font-bold uppercase block leading-none">
                  Mood Money
                </span>
                <span className="font-label-caps text-[9px] text-[#552139] tracking-widest uppercase font-bold">
                  Gen Z Survival Lab
                </span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#E94355] animate-ping" />
          </div>

          {/* Runway Capsule Badge */}
          <div className="px-4 py-3 bg-[#F2C6D5]/35 border-b-[1.5px] border-[#292225]/20 flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold tracking-wider">
              Ritual Cycle 04
            </span>
            <span className="font-label-caps text-[10px] bg-[#F6DF79] text-[#292225] px-2 py-0.5 rounded border border-[#292225] font-bold">
              Day {currentDay} / {totalDays}
            </span>
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-1.5" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = currentDestination === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border-[1.5px] font-label-caps text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#E94355] text-white border-[#292225] border-b-[3.5px] border-b-[#552139] shadow-[0_2px_0px_#292225] translate-y-[-1px]"
                      : "bg-transparent text-[#552139] border-transparent hover:bg-white hover:border-[#292225]/30 hover:shadow-[1px_1px_0px_#292225]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[19px] ${
                        isActive ? "text-white" : "text-[#552139]"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[9px] bg-[#F6DF79] text-[#292225] px-1.5 py-0.5 rounded font-extrabold border border-[#292225]/40">
                      {item.id === "challenge-hq" ? `Day ${currentDay}` : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Persistent Actions & Balance Indicator */}
        <div className="p-4 border-t-[2px] border-[#292225] bg-[#FFF9F1] space-y-2.5">
          {onOpenQuickAdd && (
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="btn-3d btn-3d-yellow w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>+ Record Entry</span>
            </button>
          )}

          <div className="p-2.5 bg-white border-[1.5px] border-[#292225] rounded-lg shadow-[2px_2px_0px_#292225]">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-label-caps text-[9px] text-[#552139] uppercase font-bold">
                Available Stash
              </span>
              <span className="font-label-caps text-[9px] text-[#E94355] font-bold">
                {Math.round((availableBalance / 10000) * 100)}% left
              </span>
            </div>
            <p className="font-headline-sm text-base font-extrabold text-[#292225]">
              ₹{availableBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#FFF9F1]/95 backdrop-blur-md border-b-[2px] border-[#292225] shadow-[0_2px_0px_#292225] z-40 px-4 flex items-center justify-between select-none">
        <div
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-4 h-4 bg-[#E94355] border-[1.5px] border-[#292225] rotate-45 shadow-[1px_1px_0px_#292225] flex-shrink-0" />
          <span className="font-headline-sm text-base font-bold uppercase text-[#292225]">
            Mood Money
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-full bg-[#F6DF79] border border-[#292225] font-label-caps text-[10px] font-bold">
            Day {currentDay}/30
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-lg bg-white border-[1.5px] border-[#292225] shadow-[1.5px_1.5px_0px_#292225] flex items-center justify-center text-[#292225] cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm pt-16 flex flex-col justify-between">
          <div className="bg-[#FFF9F1] border-b-[3px] border-[#292225] p-4 max-h-[80vh] overflow-y-auto space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-[#292225]/20">
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                Navigation Destinations
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-[#E94355] uppercase"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-2">
              {NAV_ITEMS.map((item) => {
                const isActive = currentDestination === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg border-[1.5px] font-label-caps text-xs uppercase font-bold ${
                      isActive
                        ? "bg-[#E94355] text-white border-[#292225] border-b-[3px] border-b-[#552139]"
                        : "bg-white text-[#292225] border-[#292225]/30 hover:bg-[#F6DF79]/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-[#F6DF79] text-[#292225] px-2 py-0.5 rounded border border-[#292225]">
                        {item.id === "challenge-hq" ? `Day ${currentDay}` : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {onOpenQuickAdd && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuickAdd();
                  }}
                  className="btn-3d btn-3d-yellow w-full py-3 text-xs font-bold"
                >
                  + Record Spontaneous Expense
                </button>
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}

export default NavigationSidebar;
