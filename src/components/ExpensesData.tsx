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
import type { DateRange } from "react-day-picker";

type DatePreset =
  | "day"
  | "week"
  | "month"
  | "3months"
  | "year"
  | "custom"
  | "all";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function formatRangeLabel(r?: DateRange) {
  if (!r?.from && !r?.to) return "Date Range";
  if (r.from && !r.to) return r.from.toLocaleDateString();
  if (r.from && r.to)
    return `${r.from.toLocaleDateString()} - ${r.to.toLocaleDateString()}`;
  return "Date Range";
}

function parseYYYYMMDD(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}
function sumAmount(list: ExpenseRow[]) {
  return list.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
}
function formatPeso(n: number) {
  return `₱${Math.round(n).toLocaleString()}`;
}

export const ExpensesData = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const [preset, setPreset] = useState<DatePreset>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [allExpenses, setAllExpenses] = useState<ExpenseRow[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // apply preset => auto set range
  const applyPreset = (p: DatePreset) => {
    setPreset(p);

    const today = startOfDay(new Date());

    if (p === "all") {
      setDateRange(undefined);
      return;
    }

    if (p === "day") {
      setDateRange({ from: today, to: today });
      return;
    }

    if (p === "week") {
      setDateRange({ from: addDays(today, -6), to: today });
      return;
    }

    if (p === "month") {
      setDateRange({ from: addMonths(today, -1), to: today });
      return;
    }

    if (p === "3months") {
      setDateRange({ from: addMonths(today, -3), to: today });
      return;
    }

    if (p === "year") {
      setDateRange({ from: addMonths(today, -12), to: today });
      return;
    }

    // custom: user picks in calendar
    if (p === "custom") {
      setDateRange(undefined);
    }
  };

  const filters: TableFilters = useMemo(
    () => ({
      search,
      category,
      dateRange: dateRange
        ? {
            from: dateRange.from ? startOfDay(dateRange.from) : undefined,
            to: dateRange.to ? endOfDay(dateRange.to) : undefined,
          }
        : undefined,
    }),
    [search, category, dateRange],
  );

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);

    const last7 = addDays(today, -7);
    const last30 = addDays(today, -30);
    const last90 = addDays(today, -90);

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
          <SelectContent className="h-70">
            <SelectGroup>
              <SelectLabel>Select bill</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Food">Foods</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Gift">Gift</SelectItem>
              <SelectItem value="Clothes">Clothes</SelectItem>
              <SelectItem value="Household">Household</SelectItem>
              <SelectItem value="Pets">Pets</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Date preset + range picker inside same popover (no layout change) */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex justify-around text-black/45 items-center text-sm py-2 w-full rounded-md bg-white/50 backdrop-blur-lg border border-black/20">
              {formatRangeLabel(dateRange)}
              <FontAwesomeIcon icon={faCalendar} className="ml-2" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-80 space-y-3">
            <Select
              value={preset}
              onValueChange={(v) => applyPreset(v as DatePreset)}
            >
              <SelectTrigger className="w-full bg-white/50 backdrop-blur-lg border border-black/20">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Range</SelectLabel>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last month</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(r) => {
                setPreset("custom");
                setDateRange(r);
              }}
              className="rounded-md"
              numberOfMonths={1}
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

      <TableData
        key={refreshKey}
        filters={filters}
        onExpensesChange={setAllExpenses}
      />
    </section>
  );
};
