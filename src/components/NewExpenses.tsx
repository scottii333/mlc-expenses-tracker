"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const NewExpenses = () => {
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
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
