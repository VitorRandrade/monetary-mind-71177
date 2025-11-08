import { useState, useMemo } from "react";
import { parseDate } from "@/lib/date-utils";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  subcategory: string;
  account: string;
  date: Date;
  status: "pending" | "completed" | "cancelled";
  paymentMethod: string;
  installments?: number;
  currentInstallment?: number;
  notes?: string;
}

export function useTransactionFilters(transactions: Transaction[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.account.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = filterType === "all" || transaction.type === filterType;
      
      // Date filter
      const transDate = parseDate(transaction.date);
      const matchesDate = !dateRange || transDate.toDateString() === dateRange.toDateString();
      
      return matchesSearch && matchesType && matchesDate;
    });
  }, [transactions, searchTerm, filterType, dateRange]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });
  }, [filteredTransactions]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    dateRange,
    setDateRange,
    filteredTransactions,
    sortedTransactions
  };
}
