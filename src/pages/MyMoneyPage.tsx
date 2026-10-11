import React, { useState, useMemo } from "react";
import { useFinance, type Transaction, type TransactionCategory } from "@/src/context/FinanceContext";
import confetti from "canvas-confetti";

export function MyMoneyPage() {
  const {
    transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    totalSpent,
    totalIncome,
    availableBalance,
    startingBudget,
    currentDay,
    categorySpending,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<"all" | "expense" | "income">("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState<TransactionCategory>("Food");
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formMerchant, setFormMerchant] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formDay, setFormDay] = useState(currentDay);
  const [formError, setFormError] = useState("");

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

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || tx.category === selectedCategory;

      const matchesType = selectedType === "all" || tx.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchQuery, selectedCategory, selectedType]);

  const openAddModal = () => {
    setEditingTx(null);
    setFormName("");
    setFormAmount("");
    setFormCategory("Food");
    setFormType("expense");
    setFormMerchant("");
    setFormNote("");
    setFormDay(currentDay);
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormName(tx.name);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormType(tx.type);
    setFormMerchant(tx.merchant || "");
    setFormNote(tx.note || "");
    setFormDay(tx.dayNumber);
    setFormError("");
    setShowAddModal(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formAmount);

    if (!formName.trim()) {
      setFormError("Transaction name is required");
      return;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError("Amount must be greater than ₹0");
      return;
    }

    if (editingTx) {
      editTransaction(editingTx.id, {
        name: formName.trim(),
        amount: amountVal,
        category: formCategory,
        type: formType,
        merchant: formMerchant.trim() || formCategory,
        note: formNote.trim(),
        dayNumber: formDay,
        date: `Day ${formDay.toString().padStart(2, "0")} • Settled`,
      });
    } else {
      addTransaction({
        name: formName.trim(),
        amount: amountVal,
        category: formCategory,
        type: formType,
        merchant: formMerchant.trim() || formCategory,
        note: formNote.trim(),
        dayNumber: formDay,
        date: `Day ${formDay.toString().padStart(2, "0")} • Just now`,
      });
      confetti({ particleCount: 30, spread: 50 });
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete transaction "${name}"? This will update your balance immediately.`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="flex flex-col gap-space-xl w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-lg sm:p-space-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-md border-b-[1.5px] border-[#292225]/15">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#E94355] rotate-45 border border-[#292225]" />
              <span className="font-label-caps text-xs text-[#552139] uppercase font-bold tracking-wider">
                Ledger Management System
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-4xl text-[#292225] font-extrabold tracking-tight">
              My Money &amp; Ledger
            </h1>
            <p className="font-body-sm text-sm text-[#5a4040]">
              Full audit trail of settled expenses and spontaneous purchases for Cycle 04.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="btn-3d btn-3d-cherry px-space-lg py-3 text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ Add Transaction</span>
          </button>
        </div>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-md">
          <div className="p-space-md bg-[#FFF9F1] border-[1.5px] border-[#292225] border-b-[3px] border-b-[#8e7070] rounded-xl shadow-[0_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Total Logged Spend
            </span>
            <p className="font-headline-lg font-extrabold text-[#292225] mt-1">
              ₹{totalSpent.toLocaleString()}
            </p>
            <p className="text-xs text-[#5a4040]">
              {((totalSpent / startingBudget) * 100).toFixed(1)}% of ₹10,000 challenge budget
            </p>
          </div>

          <div className="p-space-md bg-[#F6DF79]/40 border-[1.5px] border-[#292225] border-b-[3px] border-b-[#b89b1c] rounded-xl shadow-[0_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Available Runway
            </span>
            <p className="font-headline-lg font-extrabold text-[#292225] mt-1">
              ₹{availableBalance.toLocaleString()}
            </p>
            <p className="text-xs text-[#5a4040]">
              {Math.max(0, 30 - currentDay)} Days remaining in cycle
            </p>
          </div>

          <div className="p-space-md bg-[#F2C6D5]/40 border-[1.5px] border-[#292225] border-b-[3px] border-b-[#884b65] rounded-xl shadow-[0_2px_0px_#292225]">
            <span className="font-label-caps text-[10px] text-[#552139] uppercase font-bold">
              Average Burn Pace
            </span>
            <p className="font-headline-lg font-extrabold text-[#E94355] mt-1">
              ₹{Math.round(totalSpent / Math.max(1, currentDay))} / day
            </p>
            <p className="text-xs text-[#5a4040]">Daily cap target: ₹320/day</p>
          </div>
        </div>
      </div>

      {/* Category Spend Breakdown Graphical Trays */}
      <div className="bg-white rounded-xl border-[2px] border-[#292225] border-b-[4px] border-b-[#8e7070] shadow-[0_4px_0px_#292225] p-space-md sm:p-space-lg">
        <h3 className="font-headline-sm font-bold text-[#292225] mb-space-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#E94355] text-lg">pie_chart</span>
          <span>Category Spending Distribution</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
          {categories.map((cat) => {
            const spent = categorySpending[cat] || 0;
            const pct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? "All" : cat)}
                className={`p-3 rounded-lg border-[1.5px] border-[#292225] cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-[#F6DF79] shadow-[2px_2px_0px_#292225] -translate-y-0.5"
                    : "bg-[#FFF9F1] hover:bg-white shadow-[1px_1px_0px_#292225]"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-label-caps font-bold text-[#552139] uppercase">
                  <span>{cat}</span>
                  <span>{pct}%</span>
                </div>
                <p className="font-headline-sm text-base font-extrabold text-[#292225] mt-1">
                  ₹{spent.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border-[2px] border-[#292225] shadow-[0_4px_0px_#292225] p-space-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#552139]/50 text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, merchants, or notes..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-[#E94355]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg font-label-caps text-xs font-bold uppercase"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg font-label-caps text-xs font-bold uppercase"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table / List */}
      <div className="bg-white rounded-xl border-[2px] border-[#292225] border-b-[5px] border-b-[#552139] shadow-[0_5px_0px_#292225] p-space-md sm:p-space-lg">
        <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-sm">
          <span className="font-label-caps text-xs text-[#552139] uppercase font-bold">
            Showing {filteredTransactions.length} of {transactions.length} entries
          </span>
          {selectedCategory !== "All" && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-[10px] font-label-caps uppercase font-bold text-[#E94355] hover:underline"
            >
              Clear Category Filter ✕
            </button>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-[#5a4040]">
            <span className="material-symbols-outlined text-4xl text-[#552139]/30 mb-2">
              receipt_long
            </span>
            <p className="font-headline-sm font-bold text-[#292225]">No transactions found</p>
            <p className="text-xs mt-1">
              {searchQuery || selectedCategory !== "All"
                ? "Try clearing your search query or filters."
                : "Record your first expense to begin populating your financial ledger."}
            </p>
            <button
              onClick={openAddModal}
              className="btn-3d btn-3d-yellow px-4 py-2 text-xs font-bold mt-4"
            >
              + Record Entry
            </button>
          </div>
        ) : (
          <div className="divide-y-[1.5px] divide-[#292225]/10">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF9F1]/60 px-space-xs rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-space-md">
                  <div
                    className={`w-11 h-11 rounded-DEFAULT ${
                      tx.iconBg || "bg-[#F6DF79]"
                    } border-[1.5px] border-[#292225] shadow-[2px_2px_0px_#292225] flex items-center justify-center text-[#292225] flex-shrink-0`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {tx.icon || "receipt"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body-md text-body-md font-bold text-[#292225]">
                        {tx.name}
                      </span>
                      <span className="font-label-caps text-[10px] text-[#292225] uppercase bg-[#f8eaee] px-1.5 py-0.5 rounded border border-[#292225]/30">
                        {tx.category}
                      </span>
                      {tx.merchant && (
                        <span className="font-label-caps text-[10px] text-[#552139] uppercase bg-[#F6DF79]/50 px-1.5 py-0.5 rounded border border-[#292225]/20">
                          {tx.merchant}
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-xs text-[#5a4040] mt-0.5">
                      {tx.date} {tx.note && `• ${tx.note}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-space-md border-t sm:border-t-0 pt-2 sm:pt-0 border-[#292225]/10">
                  <div className="text-left sm:text-right">
                    <span
                      className={`font-headline-sm font-extrabold tracking-tight ${
                        tx.type === "income" ? "text-emerald-700" : "text-[#E94355]"
                      }`}
                    >
                      {tx.type === "income" ? `+₹${tx.amount}` : `−₹${tx.amount}`}
                    </span>
                    <p className="font-label-caps text-[10px] text-[#292225]/60 uppercase">
                      Day {tx.dayNumber} Settled
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(tx)}
                      className="p-1.5 rounded hover:bg-[#FFF9F1] border border-transparent hover:border-[#292225] text-[#552139]"
                      title="Edit Transaction"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id, tx.name)}
                      className="p-1.5 rounded hover:bg-[#ffdad6] border border-transparent hover:border-[#292225] text-[#E94355]"
                      title="Delete Transaction"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] rounded-2xl shadow-[0_8px_0px_#292225] w-full max-w-md p-space-lg relative animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
              <span className="font-headline-sm font-bold text-[#292225]">
                {editingTx ? "Edit Transaction" : "Record New Transaction"}
              </span>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#E94355] hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2 mb-3 bg-[#ffdad6] border border-[#ba1a1a] rounded text-xs text-[#ba1a1a] font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTransaction} className="space-y-3">
              <div>
                <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                  Item / Description *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Cold Coffee, Metro Fare, Textbook"
                  className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="150"
                    className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                    Cycle Day (1-30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formDay}
                    onChange={(e) => setFormDay(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-xs font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                    Merchant / Location
                  </label>
                  <input
                    type="text"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    placeholder="e.g. Canteen, Blue Tokai"
                    className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#552139] uppercase font-bold mb-1">
                  Context / Note
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. Baseline nourishment, spontaneous hangout"
                  className="w-full px-3 py-2 bg-[#FFF9F1] border-[1.5px] border-[#292225] rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="btn-3d btn-3d-cherry flex-1 py-2.5 text-xs font-bold"
                >
                  {editingTx ? "Update Transaction" : "Save Transaction"}
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
}

export default MyMoneyPage;
