"use client";

import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCalendar,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "./ui/calendar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";

import { toast } from "sonner";
import type { ExpenseRow } from "./TableData";

type ExpenseForm = {
  category: string;
  amount: string;
  description: string;
  date: Date | undefined;
};

const createEmptyForm = (): ExpenseForm => ({
  category: "",
  amount: "",
  description: "",
  date: undefined,
});

const parseYYYYMMDD = (value: string): Date | undefined => {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
};

const toFormFromExpense = (expense: ExpenseRow): ExpenseForm => ({
  category: expense.category ?? "",
  amount:
    expense.amount !== undefined && expense.amount !== null
      ? String(expense.amount)
      : "",
  description: expense.description ?? "",
  date: expense.date ? parseYYYYMMDD(expense.date) : undefined,
});

export type NewExpensesProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialExpense?: ExpenseRow | null;
};

export const NewExpenses = ({
  open: controlledOpen,
  onOpenChange,
  initialExpense,
}: NewExpensesProps) => {
  // Keep internal state so old behavior still works if parent doesn't control it
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  // This key forces a remount of the inner component whenever:
  // - dialog is opened
  // - a different expense is selected for editing
  const dialogKey = useMemo(() => {
    // When closed, keep a stable key (doesn't matter much because content isn't visible)
    if (!open) return "closed";
    return initialExpense ? `edit-${initialExpense.id}` : "create";
  }, [open, initialExpense]);

  return (
    <section>
      <div className="fixed bottom-5 right-10">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#688F6B] cursor-pointer text-2xl h-15 w-15 rounded-full hover:scale-110 transition-all duration-300 hover:bg-green-700">
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </DialogTrigger>

          <DialogContent>
            {/* Inner component remounts based on key, so no effect/setState needed */}
            <NewExpensesInner
              key={dialogKey}
              initialExpense={initialExpense}
              onSave={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

function NewExpensesInner({
  initialExpense,
  onSave,
}: {
  initialExpense?: ExpenseRow | null;
  onSave: () => void;
}) {
  const initialForms = useMemo(() => {
    if (initialExpense) return [toFormFromExpense(initialExpense)];
    return [createEmptyForm()];
  }, [initialExpense]);

  const [forms, setForms] = useState<ExpenseForm[]>(() => initialForms);

  // For form field changes
  const updateField = (
    idx: number,
    field: keyof ExpenseForm,
    value: string | Date | undefined,
  ) => {
    setForms((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Add new form and show toast
  const addForm = () => {
    setForms((prev) => [...prev, createEmptyForm()]);
    toast.success("A new expense form has been added!");
  };

  // Remove form and show toast
  const removeForm = (idx: number) => {
    setForms((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== idx),
    );
    toast.error("Expense form removed.");
  };

  // Save and show toast, then close modal
  const saveExpenses = () => {
    toast.success("Expenses have been saved.");
    onSave();
    // Save logic here
  };

  return (
    <>
      <VisuallyHidden>
        <DialogTitle>
          {initialExpense ? "Edit Expense" : "Add New Expense"}
        </DialogTitle>
      </VisuallyHidden>

      <h1 className="text-white text-2xl font-medium">
        {initialExpense ? "Edit Expense" : "Add Expenses"}
      </h1>

      <ScrollArea className="h-[40vh] w-full pr-3 ">
        {forms.map((form, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-5 border-b-2 border-white/30 pb-5 mt-2"
          >
            {/* Category */}
            <div className="flex items-center gap-4">
              <Label className="text-white text-xl flex-[0_0_30%]">
                Category
              </Label>
              <div className="flex-1">
                <Select
                  value={form.category}
                  onValueChange={(value) => updateField(idx, "category", value)}
                >
                  <SelectTrigger className="w-full bg-white/50 backdrop-blur-lg border border-black/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select bill</SelectLabel>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Transportation">
                        Transportation
                      </SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-4">
              <Label className="text-white text-xl flex-[0_0_30%]">
                Amount
              </Label>
              <Input
                type="text"
                className="flex-1 bg-white/50 backdrop-blur-lg border border-black/20 p-2 rounded-md"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) => updateField(idx, "amount", e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex items-center gap-4">
              <Label className="text-white text-xl flex-[0_0_30%]">
                Description
              </Label>
              <Input
                className="flex-1 bg-white/50 backdrop-blur-lg border border-black/20 p-2 rounded-md"
                placeholder="Enter description"
                value={form.description}
                onChange={(e) =>
                  updateField(idx, "description", e.target.value)
                }
              />
            </div>

            {/* Date */}
            <div className="flex items-center gap-4">
              <Label className="text-white text-xl flex-[0_0_30%]">Date</Label>
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex justify-between items-center text-sm py-2 px-3 w-full rounded-md bg-white/50 backdrop-blur-lg border border-black/20 text-black/55">
                      {form.date
                        ? form.date.toLocaleDateString()
                        : "Date Range"}
                      <FontAwesomeIcon icon={faCalendar} className="ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(d) => updateField(idx, "date", d)}
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              className="w-full bg-[#BD2828] opacity-90 hover:bg-red-700"
              type="button"
              onClick={() => removeForm(idx)}
              disabled={forms.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}
      </ScrollArea>

      <div className="grid grid-cols-2 gap-5">
        <Button
          className="mt-4 w-full bg-[#688F6B] hover:bg-green-700"
          onClick={saveExpenses}
          type="button"
        >
          <FontAwesomeIcon icon={faFileArrowDown} className="mr-2" />
          Save
        </Button>

        <Button
          className="mt-4 w-full bg-[#c7cec8] hover:bg-green-700"
          type="button"
          onClick={addForm}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Another
        </Button>
      </div>
    </>
  );
}
