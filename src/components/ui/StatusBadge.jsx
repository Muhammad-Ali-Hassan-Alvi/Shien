import { getOrderStatusStyle, getPriorityStyle, getTicketStatusStyle } from "@/app/lib/statusStyles";

function resolveStyle(status, type) {
    if (type === "order") return getOrderStatusStyle(status);
    if (type === "priority") return getPriorityStyle(status);
    return getTicketStatusStyle(status);
}

export default function StatusBadge({
    status,
    type = "ticket",
    size = "md",
    className = "",
}) {
    const style = resolveStyle(status, type);
    const sizeClasses =
        size === "sm"
            ? "px-2 py-0.5 text-[10px] gap-1"
            : "px-2.5 py-1 text-[11px] gap-1.5";

    return (
        <span
            className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wide ring-1 ring-inset ${style.badge} ${sizeClasses} ${className}`}
        >
            {style.dot && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} aria-hidden />
            )}
            {status}
        </span>
    );
}

export function StatusAccentBar({ status, type = "ticket", className = "" }) {
    const style = resolveStyle(status, type);
    return <div className={`absolute top-0 left-0 w-1 h-full ${style.accent} ${className}`} />;
}
