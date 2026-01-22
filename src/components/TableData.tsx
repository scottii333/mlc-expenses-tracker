"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Label } from "./ui/label";
import { NewExpenses } from "./NewExpenses";
import api from "@/lib/axios";
import { toast } from "sonner";

export type ExpenseRow = {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
};

type GetExpensesResponse = { expenses: ExpenseRow[] };
type OneExpenseResponse = { expense: ExpenseRow };

export type TableFilters = {
  search: string;
  category: string; // "all" or exact category
  date?: Date; // selected date (single)
};

function parseYYYYMMDD(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export const TableData = ({
  filters,
  onExpensesChange,
}: {
  filters: TableFilters;
  onExpensesChange?: (allExpenses: ExpenseRow[]) => void;
}) => {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [openExpensesDialog, setOpenExpensesDialog] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseRow | null>(null);

  useEffect(() => {
    onExpensesChange?.(expenses);
  }, [expenses, onExpensesChange]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const resp = await api.get<GetExpensesResponse>("/expenses");
      const list = resp.data.expenses ?? [];
      setExpenses(list);
      onExpensesChange?.(list);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ filtering stays pure (no setState / no onExpensesChange here)
  const filteredExpenses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const category = (filters.category || "all").toLowerCase();
    const selectedDate = filters.date;

    return expenses.filter((e) => {
      if (search) {
        const haystack =
          `${e.category} ${e.description} ${e.amount} ${e.date}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (category !== "all") {
        if (e.category.toLowerCase() !== category) return false;
      }

      if (selectedDate) {
        const d = parseYYYYMMDD(e.date);
        if (!d) return false;
        if (
          d.getFullYear() !== selectedDate.getFullYear() ||
          d.getMonth() !== selectedDate.getMonth() ||
          d.getDate() !== selectedDate.getDate()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  const handleEdit = (expense: ExpenseRow) => {
    setEditExpense(expense);
    setOpenExpensesDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => {
        const next = prev.filter((x) => x.id !== id);
        onExpensesChange?.(next);
        return next;
      });
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const createExpense = async (row: Omit<ExpenseRow, "id">) => {
    const resp = await api.post<OneExpenseResponse>("/expenses", row);
    return resp.data.expense;
  };

  const updateExpense = async (id: number, row: Omit<ExpenseRow, "id">) => {
    const resp = await api.put<OneExpenseResponse>(`/expenses/${id}`, row);
    return resp.data.expense;
  };

  return (
    <div className="overflow-hidden rounded-xl shadow-md">
      <Table className="min-w-full">
        <TableHeader className="bg-[#688F6B] opacity-60">
          <TableRow>
            <TableHead className="text-white p-5 border-r-2 border-white">
              Category
            </TableHead>
            <TableHead className="text-white p-5 border-r-2 border-white">
              Description
            </TableHead>
            <TableHead className="text-white p-5 border-r-2 border-white">
              Amount
            </TableHead>
            <TableHead className="text-white p-5 border-r-2 border-white">
              Date
            </TableHead>
            <TableHead className="text-white p-5">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="bg-white/30 backdrop-blur-lg border border-black/20 rounded-b-xl">
          {loading ? (
            <TableRow>
              <TableCell className="p-5 text-center" colSpan={5}>
                Loading...
              </TableCell>
            </TableRow>
          ) : filteredExpenses.length === 0 ? (
            <TableRow>
              <TableCell className="p-5 text-center" colSpan={5}>
                No expenses yet.
              </TableCell>
            </TableRow>
          ) : (
            filteredExpenses.map((expense) => (
              <TableRow
                key={expense.id}
                className="border-b border-black last:border-b-0"
              >
                <TableCell className="p-5">{expense.category}</TableCell>
                <TableCell className="p-5">{expense.description}</TableCell>
                <TableCell className="p-5">{expense.amount}</TableCell>
                <TableCell className="p-5">{expense.date}</TableCell>
                <TableCell className="p-5">
                  <div className="flex gap-4">
                    <div className="flex gap-2 items-center">
                      <FontAwesomeIcon
                        id={`Edit-${expense.id}`}
                        icon={faPenToSquare}
                        className="text-[#688F6B] opacity-60 cursor-pointer text-xl hover:scale-110 transition-transform"
                        onClick={() => handleEdit(expense)}
                      />
                      <Label
                        htmlFor={`Edit-${expense.id}`}
                        className="font-normal cursor-pointer"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </Label>
                    </div>

                    <div className="flex gap-2 items-center">
                      <FontAwesomeIcon
                        id={`Delete-${expense.id}`}
                        icon={faTrashCan}
                        className="text-[#BD2828] cursor-pointer text-xl hover:scale-110 transition-transform"
                        onClick={() => handleDelete(expense.id)}
                      />
                      <Label
                        htmlFor={`Delete-${expense.id}`}
                        className="font-normal cursor-pointer"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </Label>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <NewExpenses
        open={openExpensesDialog}
        onOpenChange={(next) => {
          setOpenExpensesDialog(next);
          if (!next) setEditExpense(null);
        }}
        initialExpense={editExpense}
        onSaveExpenses={async (rows) => {
          try {
            const toUpdate = rows.find((r) => r.id !== 0);
            const toCreate = rows.filter((r) => r.id === 0);

            if (toUpdate) {
              const updated = await updateExpense(toUpdate.id, {
                category: toUpdate.category,
                description: toUpdate.description,
                amount: toUpdate.amount,
                date: toUpdate.date,
              });

              setExpenses((prev) => {
                const next = prev.map((e) =>
                  e.id === updated.id ? updated : e,
                );
                onExpensesChange?.(next);
                return next;
              });
            }

            if (toCreate.length) {
              const created: ExpenseRow[] = [];
              for (const row of toCreate) {
                const createdRow = await createExpense({
                  category: row.category,
                  description: row.description,
                  amount: row.amount,
                  date: row.date,
                });
                created.push(createdRow);
              }

              setExpenses((prev) => {
                const next = [...created, ...prev];
                onExpensesChange?.(next);
                return next;
              });
            }
          } catch {
            toast.error("Save failed");
          }
        }}
      />
    </div>
  );
};
