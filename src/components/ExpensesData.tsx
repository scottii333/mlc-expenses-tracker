import React from "react";

export const ExpensesData = () => {
  return (
    <section className="relative w-full">
      <h1 className="text-3xl mb-4">Expenses Tracker</h1>
      <div
        className="
          grid 
          grid-cols-2 
          sm:grid-cols-4 
          gap-4
        "
      >
        {[1, 2, 3, 4].map((_, i) => (
          <div
            key={i}
            className="
              w-full
              max-h-50
              aspect-square
              bg-white/70
              backdrop-blur-lg
              border border-black/20
              rounded-lg
              flex items-center justify-center
            "
          ></div>
        ))}
      </div>
    </section>
  );
};
