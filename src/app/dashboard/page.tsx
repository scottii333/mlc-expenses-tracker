"use client";

import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { ExpensesData } from "@/components/ExpensesData";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      toast.success("Logged out");
      router.replace("/");
    } catch (e) {
      console.error(e);
      toast.error("Logout failed");
    }
  };

  return (
    <section className="p-5 w-full h-auto">
      <div className="relative w-full min-h-screen rounded-lg overflow-hidden shadow-lg border border-black/20 p-5 flex flex-col gap-5">
        <Image
          alt="bg"
          src="/dashboard-bg.png"
          fill
          className="object-cover"
          priority
        />
        <div className="flex justify-between">
          <div className="relative flex items-center space-x-2">
            <FontAwesomeIcon size="xl" icon={faWallet} />
            <h1 className="text-xl">Expenza</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="relative flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform hover:text-red-600"
          >
            <FontAwesomeIcon size="xl" icon={faArrowRightFromBracket} />
            <p className="text-xl">Logout</p>
          </button>
        </div>

        <ExpensesData />
      </div>
    </section>
  );
}
