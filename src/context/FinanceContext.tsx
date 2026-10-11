import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export type TransactionCategory =
  | "Food"
  | "Transport"
  | "Bills"
  | "Education"
  | "Personal"
  | "Emergency Reserve"
  | "Savings"
  | "Other";

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: TransactionCategory;
  type: "expense" | "income";
  date: string; // ISO or readable
  dayNumber: number; // 1 to 30
  merchant?: string;
  note?: string;
  icon?: string;
  iconBg?: string;
}

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  category: TransactionCategory;
  isPaid: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDay?: number;
  icon?: string;
  color?: string;
}

export interface FinanceContextType {
  startingBudget: number;
  currentDay: number;
  totalDays: number;
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  activeGoalId: string;
  budgetPlan: Record<TransactionCategory, number>;

  // Computed values
  totalSpent: number;
  totalIncome: number;
  availableBalance: number;
  todayConsumed: number;
  dayCap: number;
  todayLeft: number;
  essentialCommitments: number;
  dailySafeToSpend: number;
  daysRemaining: number;
  categorySpending: Record<TransactionCategory, number>;

  // Actions
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateBudgetPlan: (newPlan: Record<TransactionCategory, number>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  editSavingsGoal: (id: string, updated: Partial<SavingsGoal>) => void;
  topUpSavingsGoal: (id: string, amount: number) => void;
  setActiveGoalId: (id: string) => void;
  markCommitmentPaid: (id: string) => void;
  setChallengeDay: (day: number) => void;
  resetAllData: () => void;
}

const STORAGE_KEY = "mood_money_financial_state_v1";

const DEFAULT_CATEGORIES: TransactionCategory[] = [
  "Food",
  "Transport",
  "Bills",
  "Education",
  "Personal",
  "Emergency Reserve",
  "Savings",
  "Other",
];

const DEFAULT_BUDGET_PLAN: Record<TransactionCategory, number> = {
  Food: 3200,
  Transport: 1600,
  Bills: 1200,
  Education: 800,
  Personal: 1200,
  "Emergency Reserve": 1000,
  Savings: 800,
  Other: 200,
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    name: "Lunch",
    amount: 120,
    category: "Food",
    type: "expense",
    date: "Day 12 • 1:15 PM",
    dayNumber: 12,
    merchant: "Canteen",
    note: "Nourishment baseline",
    icon: "restaurant",
    iconBg: "bg-[#F6DF79]",
  },
  {
    id: "tx-2",
    name: "Auto fare",
    amount: 80,
    category: "Transport",
    type: "expense",
    date: "Day 12 • 9:30 AM",
    dayNumber: 12,
    merchant: "Metro connect",
    note: "Transit commuter",
    icon: "local_taxi",
    iconBg: "bg-[#F2C6D5]",
  },
  {
    id: "tx-3",
    name: "Coffee with friends",
    amount: 90,
    category: "Food",
    type: "expense",
    date: "Day 11 • 4:30 PM",
    dayNumber: 11,
    merchant: "Blue Tokai",
    note: "Social Ritual",
    icon: "local_cafe",
    iconBg: "bg-[#FFF9F1]",
  },
  {
    id: "tx-4",
    name: "Campus Notebooks",
    amount: 220,
    category: "Education",
    type: "expense",
    date: "Day 10 • 11:00 AM",
    dayNumber: 10,
    merchant: "University Bookstore",
    note: "Semester study supplies",
    icon: "menu_book",
    iconBg: "bg-[#F6DF79]",
  },
  {
    id: "tx-5",
    name: "Pharmacy Vitamins",
    amount: 350,
    category: "Personal",
    type: "expense",
    date: "Day 08 • 7:15 PM",
    dayNumber: 8,
    merchant: "Apollo Pharmacy",
    note: "Health baseline",
    icon: "medication",
    iconBg: "bg-[#F2C6D5]",
  },
  {
    id: "tx-6",
    name: "Metro Monthly SmartCard Topup",
    amount: 500,
    category: "Transport",
    type: "expense",
    date: "Day 05 • 8:45 AM",
    dayNumber: 5,
    merchant: "DMRC Station",
    note: "Transit fixed commuter",
    icon: "train",
    iconBg: "bg-[#FFF9F1]",
  },
  {
    id: "tx-7",
    name: "Groceries Baseline",
    amount: 1800,
    category: "Food",
    type: "expense",
    date: "Day 02 • 6:30 PM",
    dayNumber: 2,
    merchant: "Nature Basket",
    note: "Monthly pantry staple run",
    icon: "shopping_cart",
    iconBg: "bg-[#F6DF79]",
  },
];

const DEFAULT_COMMITMENTS: Commitment[] = [
  {
    id: "comm-1",
    title: "Mobile recharge",
    amount: 299,
    dueDay: 15,
    category: "Bills",
    isPaid: false,
  },
  {
    id: "comm-2",
    title: "Cloud & Music Subscription",
    amount: 551,
    dueDay: 18,
    category: "Bills",
    isPaid: false,
  },
];

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: "goal-1",
    title: "Emergency Cushion",
    targetAmount: 2000,
    currentAmount: 1200,
    category: "Emergency Reserve",
    targetDay: 30,
    icon: "shield",
    color: "#E94355",
  },
  {
    id: "goal-2",
    title: "Concert & Weekend Stash",
    targetAmount: 1500,
    currentAmount: 800,
    category: "Savings",
    targetDay: 30,
    icon: "headphones",
    color: "#552139",
  },
  {
    id: "goal-3",
    title: "Tech Upgrade Fund",
    targetAmount: 3000,
    currentAmount: 450,
    category: "Savings",
    targetDay: 60,
    icon: "devices",
    color: "#F6DF79",
  },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [startingBudget] = useState<number>(10000);
  const [currentDay, setCurrentDay] = useState<number>(12);
  const totalDays = 30;

  // Initialize from LocalStorage or default
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_tx`);
        if (stored) return JSON.parse(stored);
      } catch (err) {
        console.warn("Error reading stored transactions:", err);
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_comm`);
        if (stored) return JSON.parse(stored);
      } catch (err) {
        console.warn("Error reading stored commitments:", err);
      }
    }
    return DEFAULT_COMMITMENTS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_goals`);
        if (stored) return JSON.parse(stored);
      } catch (err) {
        console.warn("Error reading stored savings goals:", err);
      }
    }
    return DEFAULT_SAVINGS_GOALS;
  });

  const [activeGoalId, setActiveGoalId] = useState<string>("goal-1");

  const [budgetPlan, setBudgetPlan] = useState<Record<TransactionCategory, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_plan`);
        if (stored) return JSON.parse(stored);
      } catch (err) {
        console.warn("Error reading stored budget plan:", err);
      }
    }
    return DEFAULT_BUDGET_PLAN;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tx`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_comm`, JSON.stringify(commitments));
      localStorage.setItem(`${STORAGE_KEY}_goals`, JSON.stringify(savingsGoals));
      localStorage.setItem(`${STORAGE_KEY}_plan`, JSON.stringify(budgetPlan));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [transactions, commitments, savingsGoals, budgetPlan]);

  // Derived Financial Computations
  const totalSpent = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const availableBalance = startingBudget + totalIncome - totalSpent;

  const todayConsumed = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && t.dayNumber === currentDay)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, currentDay]);

  const daysRemaining = Math.max(1, totalDays - currentDay);
  const dayCap = 320;
  const todayLeft = Math.max(0, dayCap - todayConsumed);

  // Unpaid upcoming essential commitments
  const essentialCommitments = useMemo(() => {
    return commitments
      .filter((c) => !c.isPaid && c.dueDay >= currentDay)
      .reduce((sum, c) => sum + c.amount, 0);
  }, [commitments, currentDay]);

  const dailySafeToSpend = Math.max(
    0,
    Math.round((availableBalance - essentialCommitments) / daysRemaining)
  );

  // Category actual spending totals
  const categorySpending = useMemo(() => {
    const map = DEFAULT_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<TransactionCategory, number>);

    transactions.forEach((tx) => {
      if (tx.type === "expense") {
        const cat = tx.category in map ? tx.category : "Other";
        map[cat] = (map[cat] || 0) + Number(tx.amount);
      }
    });

    return map;
  }, [transactions]);

  // Action: Add Transaction
  const addTransaction = (txData: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dayNumber: txData.dayNumber || currentDay,
      icon:
        txData.icon ||
        (txData.category === "Food"
          ? "restaurant"
          : txData.category === "Transport"
          ? "local_taxi"
          : txData.category === "Bills"
          ? "receipt_long"
          : txData.category === "Education"
          ? "menu_book"
          : "shopping_bag"),
      iconBg:
        txData.iconBg ||
        (txData.category === "Food"
          ? "bg-[#F6DF79]"
          : txData.category === "Transport"
          ? "bg-[#F2C6D5]"
          : "bg-[#FFF9F1]"),
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Action: Edit Transaction
  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  // Action: Delete Transaction
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Action: Update Budget Plan
  const updateBudgetPlan = (newPlan: Record<TransactionCategory, number>) => {
    setBudgetPlan(newPlan);
  };

  // Action: Add Savings Goal
  const addSavingsGoal = (goalData: Omit<SavingsGoal, "id">) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  // Action: Edit Savings Goal
  const editSavingsGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
  };

  // Action: Top Up Savings Goal
  const topUpSavingsGoal = (id: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            currentAmount: g.currentAmount + amount,
          };
        }
        return g;
      })
    );
  };

  // Action: Mark Commitment Paid
  const markCommitmentPaid = (id: string) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPaid: true } : c))
    );
  };

  // Action: Set Challenge Day
  const setChallengeDay = (newDay: number) => {
    setCurrentDay(Math.min(totalDays, Math.max(1, newDay)));
  };

  // Action: Reset All
  const resetAllData = () => {
    setTransactions(DEFAULT_TRANSACTIONS);
    setCommitments(DEFAULT_COMMITMENTS);
    setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    setBudgetPlan(DEFAULT_BUDGET_PLAN);
    setCurrentDay(12);
  };

  return (
    <FinanceContext.Provider
      value={{
        startingBudget,
        currentDay,
        totalDays,
        transactions,
        commitments,
        savingsGoals,
        activeGoalId,
        budgetPlan,

        totalSpent,
        totalIncome,
        availableBalance,
        todayConsumed,
        dayCap,
        todayLeft,
        essentialCommitments,
        dailySafeToSpend,
        daysRemaining,
        categorySpending,

        addTransaction,
        editTransaction,
        deleteTransaction,
        updateBudgetPlan,
        addSavingsGoal,
        editSavingsGoal,
        topUpSavingsGoal,
        setActiveGoalId,
        markCommitmentPaid,
        setChallengeDay,
        resetAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
