import React from "react";
import { Input } from "./ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ExpensesData = () => {
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
      <div
        className="
          grid 
          grid-cols-2 
          sm:grid-cols-4 
          gap-4
        "
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="
              w-full
              max-h-50
              aspect-square
              bg-white/50
              backdrop-blur-lg
              border border-black/20
              rounded-lg
              flex flex-col items-center justify-center
            "
          >
            <span className="text-xl mb-3">{stat.label}</span>
            <span className="text-xl ">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-baseline  space-x-4">
        {" "}
        <div className="relative w-full max-w-lg">
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
          <SelectTrigger className="w-full max-w-xs mt-4 bg-white/50 backdrop-blur-lg border border-black/20">
            <SelectValue placeholder="Select Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select Date</SelectLabel>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="lastweek">Last Week</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
};
