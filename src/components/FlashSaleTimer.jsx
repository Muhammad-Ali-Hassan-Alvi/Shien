"use client";

import { useEffect, useState } from "react";

export default function FlashSaleTimer() {
  // Random "ends in" time for demo (always ~4-5 hours from now) or static?
  // Let's make it static to match screenshot "08:12:44" but ticking.
  const [time, setTime] = useState({ h: 8, m: 12, s: 44 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
            else clearInterval(timer);
          }
        }
        return { h, m, s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format = (num) => num.toString().padStart(2, "0");

  return (
    <span className="font-mono text-sm md:text-base font-bold text-red-600">
       Ends in {format(time.h)}:{format(time.m)}:{format(time.s)}
    </span>
  );
}
