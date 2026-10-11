import React, { useState } from "react";
import { useFinance, type SavingsGoal } from "@/src/context/FinanceContext";
import InteractiveMoneyJar from "@/src/components/InteractiveMoneyJar";
import confetti from "canvas-confetti";

export function SavingsLabPage() {
  const {
    savingsGoals,
    activeGoalId,
    setActiveGoalId,
    addSavingsGoal,
    editSavingsGoal,
    topUpSavingsGoal,
    availableBalance,
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form states
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCategory, setGoalCategory] = useState("Emergency Reserve");
  const [goalTargetDay, setGoalTargetDay] = useState("30");

  const activeGoal = savingsGoals.find((g) => g.id === activeGoalId) || savingsGoals[0];
  const totalVaultSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  const openAddModal = () => {
    setEditingGoal(null);
    setGoalTitle("");
    setGoalTarget("");
    setGoalCategory("Savings");
    setGoalTargetDay("30");
    setShowAddModal(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalTarget(goal.targetAmount.toString());
    setGoalCategory(goal.category);
    setGoalTargetDay(goal.targetDay?.toString() || "30");
    setShowAddModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(goalTarget);
    if (!goalTitle.trim() || isNaN(targetVal) || targetVal <= 0) return;

    if (editingGoal) {
      editSavingsGoal(editingGoal.id, {
        title: goalTitle.trim(),
        targetAmount: targetVal,
        category: goalCategory,
        targetDay: parseInt(goalTargetDay) || 30,
      });
    } else {
      addSavingsGoal({
        title: goalTitle.trim(),
        targetAmount: targetVal,
        currentAmount: 0,
        category: goalCategory,
        targetDay: parseInt(goalTargetDay) || 30,
        icon: goalCategory === "Emergency Reserve" ? "shield" : "savings",
        color: "#E94355",
      });
      confetti({ particleCount: 30, spread: 50 });
    }
    setShowAddModal(false);
  };

  const handleDeposit = (goalId: string, amount: number) => {
    const success = topUpSavingsGoal(goalId, amount);
    if (success) {
      confetti({ particleCount: 25, spread: 50 });
    }
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
                Vaults &amp; Reserve Firewalls
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#292225] font-extrabold tracking-tight">
              Savings Lab
            </h1>
            <p className="font-body-sm text-sm text-[#5a4040]">
              Lock capital into untouchable cushions so unplanned weekend splurges cannot break your ₹10,000 cap.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="btn-3d btn-3d-cherry px-space-lg py-3 text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ Create New Vault</span>
          </button>
        </div>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-md">
          <div className="p-space-md bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Total Protected Vaults
            </span>
            <p className="font-headline-lg font-extrabold text-[#292225] mt-1">
              ₹{totalVaultSavings.toLocaleString()}
            </p>
            <p className="text-xs text-[#5a4040]">Accumulated across all active goals</p>
          </div>
          <div className="p-space-md bg-[#F6DF79]/40 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Primary Firewall State
            </span>
            <p className="font-headline-lg font-extrabold text-[#292225] mt-1">
              {Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)}% Funded
            </p>
            <p className="text-xs text-[#5a4040]">
              {activeGoal.title}: ₹{activeGoal.currentAmount.toLocaleString()} / ₹{activeGoal.targetAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-space-md bg-[#F2C6D5]/40 border-[1.5px] border-[#292225] rounded-xl shadow-[2px_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Free Discretionary Left
            </span>
            <p className="font-headline-lg font-extrabold text-[#E94355] mt-1">
              ₹{availableBalance.toLocaleString()}
            </p>
            <p className="text-xs text-[#5a4040]">Available before tapping protected vaults</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Money Jar + Vaults List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: 3D Money Jar connected to active goal */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-md mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                Connected 3D Money Jar
              </span>
              <span className="font-label-caps text-[10px] bg-[#F6DF79] text-[#292225] px-2 py-0.5 rounded border border-[#292225] font-bold">
                {activeGoal.title}
              </span>
            </div>
            <p className="text-xs text-[#5a4040] mb-3">
              Coins accumulate visually inside as you top up this active goal.
            </p>
          </div>

          <InteractiveMoneyJar
            currentAmount={activeGoal.currentAmount}
            targetAmount={activeGoal.targetAmount}
            goalTitle={activeGoal.title}
            onContribute={(amt) => handleDeposit(activeGoal.id, amt)}
          />
        </div>

        {/* Right Column: Vaults Manager */}
        <div className="lg:col-span-7 space-y-space-md">
          <div className="bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg">
            <div className="flex justify-between items-center pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
              <h3 className="font-headline-sm font-bold text-[#292225] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E94355]">shield</span>
                <span>Active Savings Vaults ({savingsGoals.length})</span>
              </h3>
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
                Click a vault to connect jar
              </span>
            </div>

            <div className="space-y-space-md">
              {savingsGoals.map((goal) => {
                const isSelected = goal.id === activeGoal.id;
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                return (
                  <div
                    key={goal.id}
                    onClick={() => setActiveGoalId(goal.id)}
                    className={`p-space-md rounded-xl border-[2px] border-[#292225] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FFF9F1] border-b-[4px] border-b-[#552139] shadow-[0_3px_0px_#292225] ring-2 ring-[#E94355]"
                        : "bg-white hover:bg-[#FFF9F1]/50 shadow-[1px_1px_0px_#292225]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#E94355] text-xl">
                          {goal.icon || "savings"}
                        </span>
                        <h4 className="font-headline-sm text-base font-bold text-[#292225]">
                          {goal.title}
                        </h4>
                        {isSelected && (
                          <span className="font-label-caps text-[9px] uppercase font-extrabold bg-[#F6DF79] text-[#292225] px-1.5 py-0.5 rounded border border-[#292225]">
                            Linked to Jar
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(goal);
                          }}
                          className="p-1 rounded hover:bg-gray-100 text-[#552139]"
                          title="Edit Goal"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="font-headline-sm font-extrabold text-[#292225]">
                        ₹{goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="font-label-caps text-xs text-[#552139] font-bold">
                        Target: ₹{goal.targetAmount.toLocaleString()} ({pct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-[#f8eaee] rounded-full border-[1.5px] border-[#292225] p-[1px] overflow-hidden mb-3">
                      <div
                        className="h-full bg-[#E94355] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Quick Deposit Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#292225]/15">
                      <span className="font-label-caps text-[10px] text-[#5a4040]">
                        ₹{remaining.toLocaleString()} left to reach target
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeposit(goal.id, 100);
                          }}
                          className="btn-3d btn-3d-white py-1 px-2.5 text-[10px] font-bold"
                        >
                          + ₹100
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeposit(goal.id, 250);
                          }}
                          className="btn-3d btn-3d-yellow py-1 px-2.5 text-[10px] font-bold"
                        >
                          + ₹250
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] rounded-2xl shadow-[0_8px_0px_#292225] w-full max-w-md p-space-lg relative animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
              <span className="font-headline-sm font-bold text-[#292225]">
                {editingGoal ? "Edit Savings Vault" : "Create New Savings Vault"}
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#E94355] hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                  Vault Name / Goal *
                </label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Goa Trip, New Sneakers, Emergency Cushion"
                  className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                    Target Goal (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={goalTarget}
                    onChange={(e) => setCostStrSafe(e.target.value)}
                    placeholder="2000"
                    className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                    Target Day (1-30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={goalTargetDay}
                    onChange={(e) => setGoalTargetDay(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                  Category Type
                </label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-xs font-bold"
                >
                  <option value="Emergency Reserve">Emergency Reserve</option>
                  <option value="Savings">Discretionary Savings</option>
                  <option value="Personal">Tech &amp; Style</option>
                  <option value="Other">Lifestyle Milestone</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="btn-3d btn-3d-cherry flex-1 py-2.5 text-xs font-bold"
                >
                  {editingGoal ? "Update Vault" : "Create Vault"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-3d btn-3d-white px-4 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function setCostStrSafe(val: string) {
    setGoalTarget(val);
  }
}

export default SavingsLabPage;
