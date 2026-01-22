"use client";

import React, { useState } from "react";
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

export type ExpenseRow = {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
};

export const TableData = () => {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([
    {
      id: 1,
      category: "Food",
      description: "Lunch at Cafe",
      amount: 250,
      date: "2026-01-22",
    },
    {
      id: 2,
      category: "Transportation",
      description: "Taxi fare",
      amount: 150,
      date: "2026-01-21",
    },
    {
      id: 3,
      category: "Utilities",
      description: "Electricity bill",
      amount: 1200,
      date: "2026-01-20",
    },
  ]);

  const [openExpensesDialog, setOpenExpensesDialog] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseRow | null>(null);

  const handleDelete = (id: number) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const handleEdit = (expense: ExpenseRow) => {
    setEditExpense(expense);
    setOpenExpensesDialog(true);
  };

  const getNextId = (list: ExpenseRow[]) =>
    list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;

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
          {expenses.map((expense) => (
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
                      className="font-normal"
                    >
                      Delete
                    </Label>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <NewExpenses
        open={openExpensesDialog}
        onOpenChange={(next) => {
          setOpenExpensesDialog(next);
          if (!next) setEditExpense(null); // important so "+" opens empty next time
        }}
        initialExpense={editExpense}
        onSaveExpenses={(savedRows) => {
          setExpenses((prev) => {
            // EDIT mode: update just one row (we will send one row)
            if (editExpense) {
              const updated = savedRows[0];
              return prev.map((e) => (e.id === editExpense.id ? updated : e));
            }

            // CREATE mode: append all new rows with fresh ids
            let nextId = getNextId(prev);
            const toAdd = savedRows.map((r) => ({ ...r, id: nextId++ }));
            return [...prev, ...toAdd];
          });
        }}
      />
    </div>
  );
};
