"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import {
    getOrderStatusStyle,
    getPriorityStyle,
    getTicketStatusStyle,
} from "@/app/lib/statusStyles";

const DEFAULT_STYLE = {
    dot: "bg-gray-400",
    badge: "bg-gray-900 text-white border-gray-900",
    select: "bg-gray-50 text-gray-900 border-gray-200 hover:border-gray-300 focus:ring-gray-900/10",
};

function resolveStyle(value, variant) {
    if (variant === "order") return getOrderStatusStyle(value);
    if (variant === "priority") return getPriorityStyle(value);
    if (variant === "ticket-status") return getTicketStatusStyle(value);
    return DEFAULT_STYLE;
}

function normalizeOptions(options) {
    return options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    );
}

const SIZE = {
    sm: {
        trigger: "rounded-lg px-3 py-1.5 text-xs",
        item: "rounded-lg px-2.5 py-2 text-xs",
        dot: "h-1.5 w-1.5",
        itemH: 36,
    },
    md: {
        trigger: "rounded-xl px-4 py-2.5 text-sm",
        item: "rounded-xl px-3 py-2.5 text-sm",
        dot: "h-2 w-2",
        itemH: 44,
    },
};

/**
 * Custom dropdown with portal-rendered menu — never clipped by overflow:hidden parents.
 */
export default function StyledSelect({
    value,
    onChange,
    options,
    variant = "default",
    disabled = false,
    className = "",
    menuClassName = "",
    id,
    name,
    required = false,
    "aria-label": ariaLabel,
    placeholder = "Select…",
    size = "md",
    showIndicator,
    placement = "auto",
}) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [menuPos, setMenuPos] = useState(null);
    const [openUp, setOpenUp] = useState(false);

    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const showDot = showIndicator ?? variant !== "default";
    const sz = SIZE[size] ?? SIZE.md;
    const items = normalizeOptions(options);
    const selected = items.find((o) => o.value === value);
    const triggerStyle = resolveStyle(value, variant);

    useEffect(() => setMounted(true), []);

    const updateMenuPosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const menuEl = menuRef.current;
        const estimatedH = menuEl?.offsetHeight ?? Math.min(items.length * sz.itemH + 12, 256);
        const gap = 8;
        const spaceBelow = window.innerHeight - rect.bottom - gap;
        const spaceAbove = rect.top - gap;

        let flipUp = false;
        if (placement === "top") flipUp = true;
        else if (placement === "bottom") flipUp = false;
        else flipUp = spaceBelow < estimatedH && spaceAbove > spaceBelow;

        setOpenUp(flipUp);
        setMenuPos({
            left: rect.left,
            width: rect.width,
            top: flipUp ? rect.top - gap : rect.bottom + gap,
        });
    }, [items.length, placement, sz.itemH]);

    useLayoutEffect(() => {
        if (!open) return;
        updateMenuPosition();
        requestAnimationFrame(updateMenuPosition);
    }, [open, updateMenuPosition]);

    useEffect(() => {
        if (!open) return;

        const onScrollOrResize = () => updateMenuPosition();
        window.addEventListener("resize", onScrollOrResize);
        window.addEventListener("scroll", onScrollOrResize, true);

        return () => {
            window.removeEventListener("resize", onScrollOrResize);
            window.removeEventListener("scroll", onScrollOrResize, true);
        };
    }, [open, updateMenuPosition]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e) => {
            const t = e.target;
            if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
            setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const pick = (val) => {
        if (disabled) return;
        if (val !== value) {
            onChange?.({ target: { value: val, name } });
        }
        setOpen(false);
    };

    const menu =
        open && menuPos && mounted ? (
            <ul
                ref={menuRef}
                role="listbox"
                aria-label={ariaLabel}
                style={{
                    position: "fixed",
                    left: menuPos.left,
                    width: menuPos.width,
                    top: menuPos.top,
                    transform: openUp ? "translateY(-100%)" : undefined,
                    zIndex: 9999,
                }}
                className={`max-h-64 space-y-0.5 overflow-y-auto rounded-2xl border border-gray-200/90 bg-white p-1.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
            >
                {items.map((opt) => {
                    const optStyle = resolveStyle(opt.value, variant);
                    const isSelected = opt.value === value;

                    return (
                        <li key={String(opt.value)} role="option" aria-selected={isSelected}>
                            <button
                                type="button"
                                onClick={() => pick(opt.value)}
                                className={`flex w-full items-center gap-2.5 border text-left font-semibold transition-all ${sz.item} ${
                                    isSelected
                                        ? variant === "default"
                                            ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                                            : `${optStyle.badge} border ring-1 ring-inset shadow-sm`
                                        : "border-transparent text-gray-700 hover:bg-gray-50 active:scale-[0.99]"
                                }`}
                            >
                                {showDot && (
                                    <span
                                        className={`shrink-0 rounded-full ${sz.dot} ${optStyle.dot}`}
                                        aria-hidden
                                    />
                                )}
                                <span className="flex-1 truncate">{opt.label}</span>
                                {isSelected && (
                                    <Check
                                        size={size === "sm" ? 12 : 14}
                                        className="shrink-0 opacity-80"
                                        aria-hidden
                                    />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        ) : null;

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                disabled={disabled}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => !disabled && setOpen((v) => !v)}
                className={`flex w-full items-center justify-between gap-2 border font-semibold shadow-sm outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 focus:ring-2 ${sz.trigger} ${triggerStyle.select}`}
            >
                <span className="flex min-w-0 items-center gap-2 truncate">
                    {showDot && selected && (
                        <span
                            className={`shrink-0 rounded-full ${sz.dot} ${triggerStyle.dot}`}
                            aria-hidden
                        />
                    )}
                    {selected ? (
                        <span className="truncate">{selected.label}</span>
                    ) : (
                        <span className="truncate font-medium text-gray-400">{placeholder}</span>
                    )}
                </span>
                <ChevronDown
                    size={size === "sm" ? 14 : 16}
                    className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    aria-hidden
                />
            </button>

            {name ? (
                <input type="hidden" name={name} value={value ?? ""} readOnly required={required} />
            ) : null}

            {mounted && menu ? createPortal(menu, document.body) : null}
        </div>
    );
}
