"use client";

import React, { useState } from "react";
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

export const NewExpenses = () => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  return (
    <section>
      <div className="fixed bottom-5 right-10">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#688F6B] cursor-pointer text-2xl h-15 w-15 rounded-full hover:scale-110 transition-all duration-300 hover:bg-green-700">
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <VisuallyHidden>
              <DialogTitle>Add New Expense</DialogTitle>
            </VisuallyHidden>
            <h1 className="text-white text-2xl font-medium">Add Expenses</h1>
            <ScrollArea className="h-[40vh] w-full pr-3 ">
              <div className="flex flex-col gap-5 border-b-2 border-white/30 pb-5 mt-2">
                {/* Category */}
                <div className="flex items-center gap-4">
                  <Label className="text-white text-xl flex-[0_0_30%]">
                    Category
                  </Label>
                  <div className="flex-1">
                    <Select>
                      <SelectTrigger className="w-full bg-white/50 backdrop-blur-lg border border-black/20">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select bill</SelectLabel>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="transportation">
                            Transportation
                          </SelectItem>
                          <SelectItem value="foods">Foods</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
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
                  />
                </div>

                {/* Date */}
                <div className="flex items-center gap-4">
                  <Label className="text-white text-xl flex-[0_0_30%]">
                    Date
                  </Label>
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="flex justify-between items-center text-sm py-2 px-3 w-full rounded-md bg-white/50 backdrop-blur-lg border border-black/20 text-black/55">
                          Date Range
                          <FontAwesomeIcon icon={faCalendar} className="ml-2" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button className="w-full bg-[#BD2828] opacity-90 hover:bg-red-700">
                  Remove
                </Button>
              </div>
            </ScrollArea>

            <div className="grid grid-cols-2 gap-5">
              <Button className="mt-4 w-full bg-[#688F6B] hover:bg-green-700">
                <FontAwesomeIcon icon={faFileArrowDown} className="mr-2" />
                Save
              </Button>
              <Button className="mt-4 w-full bg-[#c7cec8] hover:bg-green-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Another
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
