"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faRotateRight,
  faCalendar,
  faPesoSign,
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
import { TableData } from "./TableData";

export const ExpensesData = () => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  // Label and value pairs, you can swap values as needed!
  const stats = [
    { label: "Total Expenses", value: "₱48,750" },
    { label: "Last Week", value: "₱9,500" },
    { label: "Last Month", value: "₱21,300" },
    { label: "Last 3 Months", value: "₱41,600" },
  ];

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
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full bg-white/50 backdrop-blur-lg border border-black/20">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select bill</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="foods">Foods</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex justify-around text-black/55  items-center text-sm py-2 w-full rounded-md bg-white/50 backdrop-blur-lg border border-black/20">
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
        <button className="bg-[#688F6B] opacity-60 backdrop-blur-lg border border-black/20 px-4 py-2 w-full rounded-md text-white font-medium flex items-center justify-center space-x-2 hover:bg-[#5a7e5a] transition gap-4">
          <FontAwesomeIcon icon={faRotateRight} /> Refresh
        </button>
      </div>

      <TableData />
    </section>
  );
};
