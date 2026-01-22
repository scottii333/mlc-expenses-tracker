"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faPenToSquare,
  faPlus,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";

export const TableData = () => {
  const expenses = [
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
  ];

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
              className="border-b border-black last:border-b-0" // adds border-bottom to each row, except the last one
            >
              <TableCell className="p-5">{expense.category}</TableCell>
              <TableCell className="p-5">{expense.description}</TableCell>
              <TableCell className="p-5">{expense.amount}</TableCell>
              <TableCell className="p-5">{expense.date}</TableCell>
              <TableCell className="p-5">
                <div className="flex gap-4">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    className="text-[#688F6B] opacity-60 cursor-pointer hover:scale-110 transition-transform"
                  />
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    className="text-[#BD2828]  cursor-pointer hover:scale-110 transition-transform"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
