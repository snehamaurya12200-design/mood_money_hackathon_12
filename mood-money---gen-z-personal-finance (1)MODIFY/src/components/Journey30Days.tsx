import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Journey30DaysProps {
  currentDay: number;
  totalDays: number;
  spentSoFar: number;
  todayConsumed: number;
  dayCap: number;
  availableBalance: number;
  className?: string;
}

export function Journey30Days({
  currentDay = 12,
  totalDays = 30,
  spentSoFar = 3160,
  todayConsumed = 90,
  dayCap = 320,
  availableBalance = 6840,
  className = "",
}: Journey30DaysProps) {
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  const pastAverage = Math.round(spentSoFar / Math.max(1, currentDay - 1));

  // Day data generator
  const getDayInfo = (dayNum: number) => {
    const isPast = dayNum < currentDay;
    const isToday = dayNum === currentDay;
    const isFuture = dayNum > currentDay;

    let spend = 0;
    let label = "";

    if (isPast) {
      // Historical actual / baseline sample
      spend = dayNum === 11 ? 290 : dayNum === 10 ? 310 : pastAverage;
      label = "Completed · Settled";
    } else if (isToday) {
      spend = todayConsumed;
      label = "Active · In Progress";
    } else {
      spend = dayCap;
      label = "Future Runway Cap";
    }

    return { isPast, isToday, isFuture, spend, label };
  };

  const selectedInfo = getDayInfo(selectedDay);

  return (
    <div
      className={`bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225,0_10px_20px_rgba(41,34,37,0.08)] p-space-md sm:p-space-lg select-none ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border border-[#292225]" />
            <h3 className="font-headline-md text-headline-md font-bold text-[#292225]">
              30-Day Financial Challenge Grid
            </h3>
          </div>
          <p className="font-body-sm text-xs sm:text-sm text-[#5a4040]">
            Tactile runway map for Ritual Cycle 04. Surviving Day {currentDay} of {totalDays}.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-label-caps font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F2C6D5] border border-[#292225]" />
            <span>Past Days</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E94355] border border-[#292225] animate-pulse" />
            <span>Today ({currentDay})</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FFF9F1] border border-[#292225]/40" />
            <span>Runway</span>
          </span>
        </div>
      </div>

      {/* 30-Day Tactile Tiles Grid (5 rows of 6 or 3 rows of 10) */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 sm:gap-2 mb-space-md">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
          const isPast = d < currentDay;
          const isToday = d === currentDay;
          const isSelected = d === selectedDay;

          let tileBg = "bg-[#FFF9F1] text-[#292225]/70 hover:bg-[#F6DF79]/40";
          let tileBorder = "border-[#292225]/30";
          let shadow = "shadow-[1px_1px_0px_#292225]";

          if (isToday) {
            tileBg = "bg-[#E94355] text-white font-extrabold";
            tileBorder = "border-[#292225] border-b-[3px] border-b-[#552139]";
            shadow = "shadow-[0_2px_0px_#292225]";
          } else if (isPast) {
            tileBg = "bg-[#F2C6D5]/60 text-[#552139] hover:bg-[#F2C6D5]";
            tileBorder = "border-[#292225]/50";
          }

          if (isSelected) {
            tileBorder = "ring-2 ring-[#E94355] border-[#292225]";
          }

          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`h-11 sm:h-12 rounded-lg border-[1.5px] ${tileBorder} ${tileBg} ${shadow} flex flex-col items-center justify-center p-1 transition-all cursor-pointer hover:scale-105 active:scale-95`}
              aria-label={`Inspect Day ${d}`}
            >
              <span className="font-label-caps text-[10px] sm:text-xs">
                D{d.toString().padStart(2, "0")}
              </span>
              {isToday ? (
                <span className="text-[8px] uppercase tracking-tighter bg-[#F6DF79] text-[#292225] px-1 rounded font-bold mt-0.5">
                  NOW
                </span>
              ) : isPast ? (
                <span className="text-[9px] text-[#552139] font-semibold">✓</span>
              ) : (
                <span className="text-[9px] text-[#292225]/40 font-mono">₹{dayCap}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Inspector Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="p-space-md bg-[#FFF9F1] rounded-xl border-[1.5px] border-[#292225] border-b-[3.5px] border-b-[#552139] shadow-[0_2px_0px_#292225] flex flex-col sm:flex-row sm:items-center justify-between gap-space-md"
        >
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-lg bg-[#F6DF79] border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] flex flex-col items-center justify-center font-bold text-[#292225] flex-shrink-0">
              <span className="font-label-caps text-[9px] uppercase">DAY</span>
              <span className="font-headline-sm text-base leading-none">
                {selectedDay.toString().padStart(2, "0")}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm font-bold text-[#292225]">
                  Day {selectedDay} Snapshot
                </span>
                <span className="font-label-caps text-[10px] uppercase font-bold bg-white px-2 py-0.5 rounded border border-[#292225]">
                  {selectedInfo.label}
                </span>
              </div>
              <p className="font-body-sm text-xs text-[#5a4040]">
                {selectedInfo.isToday
                  ? `Current challenge focus. ₹${todayConsumed} logged against ₹${dayCap} daily allowance.`
                  : selectedInfo.isPast
                  ? "Historical cycle ledger entry. Safely finalized within baseline."
                  : `Projected future runway. Safe discretionary allowance locked at ₹${dayCap}/day.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-[#292225]/20 pt-2 sm:pt-0 sm:pl-4 justify-between sm:justify-end">
            <div>
              <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
                {selectedInfo.isPast ? "Recorded Spend" : selectedInfo.isToday ? "Spent Today" : "Target Cap"}
              </span>
              <p className="font-headline-sm font-extrabold text-[#E94355]">
                ₹{selectedInfo.spend.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
                Cycle Runway Left
              </span>
              <p className="font-headline-sm font-bold text-[#292225]">
                {Math.max(0, totalDays - selectedDay)} Days
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Journey30Days;
