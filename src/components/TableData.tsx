"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Label } from "./ui/label";
import { NewExpenses } from "./NewExpenses";
import api from "@/lib/axios";
import { toast } from "sonner";

// Alert dialog (confirm) components
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

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
  dateRange?: { from?: Date; to?: Date };
};

function parseYYYYMMDD(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function formatPeso(n: number) {
  return `₱${Math.round(n).toLocaleString()}`;
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

  // delete confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ExpenseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    onExpensesChange?.(expenses);
  }, [expenses, onExpensesChange]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const resp = await api.get<GetExpensesResponse>("/expenses");
      const list = resp.data.expenses ?? [];
      setExpenses(list);
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

  const filteredExpenses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const category = (filters.category || "all").toLowerCase();
    const range = filters.dateRange;

    // normalize range bounds
    const from = range?.from
      ? new Date(
          range.from.getFullYear(),
          range.from.getMonth(),
          range.from.getDate(),
        )
      : undefined;

    const to = range?.to
      ? new Date(
          range.to.getFullYear(),
          range.to.getMonth(),
          range.to.getDate(),
          23,
          59,
          59,
          999,
        )
      : undefined;

    return expenses.filter((e) => {
      if (search) {
        const haystack =
          `${e.category} ${e.description} ${e.amount} ${e.date}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (category !== "all") {
        if (e.category.toLowerCase() !== category) return false;
      }

      if (from || to) {
        const d = parseYYYYMMDD(e.date);
        if (!d) return false;

        const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (from && dd < from) return false;
        if (to && dd > to) return false;
      }

      return true;
    });
  }, [expenses, filters]);

  // total of currently visible (filtered) expenses
  const totalVisible = useMemo(
    () => filteredExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    [filteredExpenses],
  );

  // caption text depends on dateRange (if provided) otherwise show "All shown"
  const captionText = useMemo(() => {
    const range = filters.dateRange;
    let rangeLabel = "All time";
    if (range?.from && range?.to) {
      rangeLabel = `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
    } else if (range?.from && !range?.to) {
      rangeLabel = `${range.from.toLocaleDateString()}`;
    } else if (!range?.from && range?.to) {
      rangeLabel = `Until ${range.to.toLocaleDateString()}`;
    } else if (!range) {
      rangeLabel = "All time";
    }

    return `Total (${rangeLabel}): ${formatPeso(totalVisible)}`;
  }, [filters.dateRange, totalVisible]);

  const handleEdit = (expense: ExpenseRow) => {
    setEditExpense(expense);
    setOpenExpensesDialog(true);
  };

  // Open confirmation dialog for deletion
  const requestDelete = (expense: ExpenseRow) => {
    setPendingDelete(expense);
    setConfirmOpen(true);
  };

  // Perform deletion after user confirms
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/expenses/${pendingDelete.id}`);
      setExpenses((prev) => prev.filter((x) => x.id !== pendingDelete.id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setPendingDelete(null);
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

  function truncateText(text: string, maxLength: number) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl shadow-md">
        <Table className="min-w-full">
          <TableCaption>{captionText}</TableCaption>

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
                  <TableCell className="p-5">
                    {truncateText(expense.description, 30)}
                  </TableCell>
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
                        <button
                          aria-label={`Delete expense ${expense.description}`}
                          className="flex items-center gap-2"
                          onClick={() => requestDelete(expense)}
                        >
                          <FontAwesomeIcon
                            id={`Delete-${expense.id}`}
                            icon={faTrashCan}
                            className="text-[#BD2828] cursor-pointer text-xl hover:scale-110 transition-transform"
                          />
                          <Label
                            htmlFor={`Delete-${expense.id}`}
                            className="font-normal cursor-pointer"
                            onClick={() => requestDelete(expense)}
                          >
                            Delete
                          </Label>
                        </button>
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

                  return next;
                });
              }
            } catch {
              toast.error("Save failed");
            }
          }}
        />
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) {
            setPendingDelete(null);
            setDeleting(false);
          }
        }}
      >
        <AlertDialogContent className=" border  border-black/50 ">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Confirm delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-black/70 mt-4 text-center">
              {pendingDelete ? (
                <>
                  Are you sure you want to permanently delete
                  <span className="font-semibold">
                    {" "}
                    {pendingDelete.category}{" "}
                  </span>
                  <span className="italic  font-semibold">
                    {truncateText(pendingDelete.description, 60)}
                  </span>
                  <span className="font-medium"> {pendingDelete.date}</span>?
                  This action cannot be undone.
                </>
              ) : (
                "Are you sure you want to delete this expense? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={async (e) => {
                e?.preventDefault?.();
                await confirmDelete();
              }}
              disabled={deleting}
              className="bg-[#BD2828] opacity-90 hover:bg-[#a82323] text-white "
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
