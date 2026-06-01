"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer({ endsAt }) {
    const [parts, setParts] = useState(null);

    useEffect(() => {
        if (!endsAt) {
            setParts(null);
            return;
        }

        const end = new Date(endsAt).getTime();

        const tick = () => {
            const diff = Math.max(0, end - Date.now());
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setParts({ h, m, s });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endsAt]);

    if (!parts) return null;

    const pad = (n) => String(n).padStart(2, "0");

    return (
        <div className="flex gap-1 text-sm font-bold text-white items-center">
            <span className="bg-black rounded-[4px] w-6 h-6 flex items-center justify-center">{pad(parts.h)}</span>
            <span className="text-black">:</span>
            <span className="bg-black rounded-[4px] w-6 h-6 flex items-center justify-center">{pad(parts.m)}</span>
            <span className="text-black">:</span>
            <span className="bg-black rounded-[4px] w-6 h-6 flex items-center justify-center">{pad(parts.s)}</span>
        </div>
    );
}
