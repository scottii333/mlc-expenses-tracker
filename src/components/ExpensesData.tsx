"use client";

import React, { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faRotateRight,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
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
import { Calendar } from "./ui/calendar";
import { TableData, type ExpenseRow, type TableFilters } from "./TableData";

function parseYYYYMMDD(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sumAmount(list: ExpenseRow[]) {
  return list.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
}

function formatPeso(n: number) {
  // keep your UI text, just format nicely
  return `₱${Math.round(n).toLocaleString()}`;
}

export const ExpensesData = () => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  // store all expenses from TableData (for stats)
  const [allExpenses, setAllExpenses] = useState<ExpenseRow[]>([]);

  // refresh trigger (changes key to remount TableData and refetch)
  const [refreshKey, setRefreshKey] = useState(0);

  const filters: TableFilters = useMemo(
    () => ({ search, category, date }),
    [search, category, date],
  );

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    const last7 = new Date(today);
    last7.setDate(last7.getDate() - 7);

    const last30 = new Date(today);
    last30.setDate(last30.getDate() - 30);

    const last90 = new Date(today);
    last90.setDate(last90.getDate() - 90);

    const withParsed = allExpenses
      .map((e) => ({ e, d: parseYYYYMMDD(e.date) }))
      .filter((x) => !!x.d) as Array<{ e: ExpenseRow; d: Date }>;

    const total = sumAmount(allExpenses);

    const lastWeek = sumAmount(
      withParsed.filter((x) => x.d >= last7).map((x) => x.e),
    );

    const lastMonth = sumAmount(
      withParsed.filter((x) => x.d >= last30).map((x) => x.e),
    );

    const last3Months = sumAmount(
      withParsed.filter((x) => x.d >= last90).map((x) => x.e),
    );

    return [
      { label: "Total Expenses", value: formatPeso(total) },
      { label: "Last Week", value: formatPeso(lastWeek) },
      { label: "Last Month", value: formatPeso(lastMonth) },
      { label: "Last 3 Months", value: formatPeso(last3Months) },
    ];
  }, [allExpenses]);

  return (
    <section className="relative w-full flex flex-col space-y-6">
      <h1 className="text-3xl mb-4">Expenses Tracker</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="w-full max-h-50 aspect-square bg-white/50 backdrop-blur-lg border border-black/20 rounded-lg flex flex-col items-center justify-center"
          >
            <span className="text-xl mb-3">{stat.label}</span>
            <span className="text-xl">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-[35%_20%_20%_20%] gap-5 items-baseline space-x-4">
        <div className="relative w-full">
          <Input
            placeholder="Search"
            className="pr-10 bg-white/50 backdrop-blur-lg border border-black/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50"
          />
        </div>

        <Select value={category} onValueChange={(v) => setCategory(v)}>
          <SelectTrigger className="w-full bg-white/50 backdrop-blur-lg border border-black/20">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select bill</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {/* values must match what you store in DB/table */}
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Food">Foods</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex justify-around text-black/45 items-center text-sm py-2 w-full rounded-md bg-white/50 backdrop-blur-lg border border-black/20">
              Date Range
              <FontAwesomeIcon icon={faCalendar} className="ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>

        <button
          className="bg-[#688F6B] opacity-60 backdrop-blur-lg border border-black/20 px-4 py-2 w-full rounded-md text-white font-medium flex items-center justify-center space-x-2 hover:bg-[#5a7e5a] transition gap-4"
          onClick={() => setRefreshKey((k) => k + 1)}
          type="button"
        >
          <FontAwesomeIcon icon={faRotateRight} /> Refresh
        </button>
      </div>

      {/* key remount triggers re-fetch in TableData without changing UI */}
      <TableData
        key={refreshKey}
        filters={filters}
        onExpensesChange={setAllExpenses}
      />
    </section>
  );
};
