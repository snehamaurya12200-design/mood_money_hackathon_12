import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFinance, type TransactionCategory } from "@/src/context/FinanceContext";
import confetti from "canvas-confetti";

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: TransactionCategory[] = [
  "Food",
  "Transport",
  "Bills",
  "Education",
  "Personal",
  "Emergency Reserve",
  "Savings",
  "Other",
];

export function QuickEntryModal({ isOpen, onClose }: QuickEntryModalProps) {
  const { addTransaction, currentDay } = useFinance();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [merchant, setMerchant] = useState("Canteen");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!name.trim()) {
      setError("Please provide an expense description");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than ₹0");
      return;
    }

    addTransaction({
      name: name.trim(),
      amount: amountNum,
      category,
      type: "expense",
      date: `Day ${currentDay} · Just now`,
      dayNumber: currentDay,
      merchant: merchant.trim() || undefined,
      note: note.trim() || undefined,
    });

    setName("");
    setAmount("");
    setNote("");
    setError("");
    onClose();

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#E94355", "#F6DF79", "#552139"],
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ type: "spring", damping: 26, stiffness: 360 }}
          className="bg-[#FFF9F1] border-[2px] border-[#292225] border-b-[6px] border-b-[#552139] rounded-2xl shadow-[0_8px_0px_#292225,0_20px_35px_rgba(41,34,37,0.25)] w-full max-w-lg p-space-lg relative z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-space-sm border-b-[1.5px] border-[#292225]/15 mb-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E94355]">add_circle</span>
              <span className="font-headline-sm font-bold text-[#292225]">
                + Record Quick Entry
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#E94355] text-[#292225] hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-space-md">
            {error && (
              <div className="p-2 bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold rounded border border-[#ba1a1a]/30">
                {error}
              </div>
            )}

            <div>
              <label className="font-label-caps text-xs text-[#552139] uppercase font-bold block mb-1">
                Item / Spontaneous Expense Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Campus Chai & Samosa, Auto Fare"
                className="w-full p-2.5 bg-white border-[1.5px] border-[#292225] rounded-lg text-sm text-[#292225] focus:outline-none focus:ring-2 focus:ring-[#E94355]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-caps text-xs text-[#552139] uppercase font-bold block mb-1">
                  Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-sm text-[#292225]">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="120"
                    min="1"
                    className="w-full p-2.5 pl-7 bg-white border-[1.5px] border-[#292225] rounded-lg text-sm text-[#292225] font-bold focus:outline-none focus:ring-2 focus:ring-[#E94355]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#552139] uppercase font-bold block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full p-2.5 bg-white border-[1.5px] border-[#292225] rounded-lg text-sm text-[#292225] focus:outline-none focus:ring-2 focus:ring-[#E94355]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-caps text-xs text-[#552139] uppercase font-bold block mb-1">
                  Merchant / Place
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Canteen, Metro station"
                  className="w-full p-2.5 bg-white border-[1.5px] border-[#292225] rounded-lg text-sm text-[#292225] focus:outline-none focus:ring-2 focus:ring-[#E94355]"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#552139] uppercase font-bold block mb-1">
                  Context / Mood Note
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Quick recharge, morning study"
                  className="w-full p-2.5 bg-white border-[1.5px] border-[#292225] rounded-lg text-sm text-[#292225] focus:outline-none focus:ring-2 focus:ring-[#E94355]"
                />
              </div>
            </div>

            <div className="flex gap-space-sm pt-space-sm">
              <button
                type="button"
                onClick={onClose}
                className="btn-3d btn-3d-white flex-1 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-3d btn-3d-cherry flex-1 py-2.5 text-xs font-bold text-white"
              >
                Save &amp; Deduct from Stash
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default QuickEntryModal;
