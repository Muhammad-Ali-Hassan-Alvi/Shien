/** Shared status / priority visual tokens */

export const TICKET_STATUS = {
    Open: {
        dot: "bg-emerald-500",
        accent: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-emerald-100",
        select: "bg-emerald-50 text-emerald-900 border-emerald-300 focus:ring-emerald-200",
    },
    "In Progress": {
        dot: "bg-sky-500",
        accent: "bg-sky-500",
        badge: "bg-sky-50 text-sky-800 border-sky-200/80 ring-sky-100",
        select: "bg-sky-50 text-sky-900 border-sky-300 focus:ring-sky-200",
    },
    Resolved: {
        dot: "bg-teal-500",
        accent: "bg-teal-500",
        badge: "bg-teal-50 text-teal-800 border-teal-300/80 ring-teal-100",
        select: "bg-teal-50 text-teal-900 border-teal-400 focus:ring-teal-200",
    },
    Closed: {
        dot: "bg-slate-400",
        accent: "bg-slate-400",
        badge: "bg-slate-100 text-slate-700 border-slate-300/80 ring-slate-200",
        select: "bg-slate-50 text-slate-800 border-slate-300 focus:ring-slate-200",
    },
};

export const ORDER_STATUS = {
    Pending: {
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-900 border-amber-200/80 ring-amber-100",
        select: "bg-amber-50 text-amber-900 border-amber-300 focus:ring-amber-200",
    },
    Confirmed: {
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-800 border-blue-200/80 ring-blue-100",
        select: "bg-blue-50 text-blue-900 border-blue-300 focus:ring-blue-200",
    },
    Dispatched: {
        dot: "bg-violet-500",
        badge: "bg-violet-50 text-violet-800 border-violet-200/80 ring-violet-100",
        select: "bg-violet-50 text-violet-900 border-violet-300 focus:ring-violet-200",
    },
    Delivered: {
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-emerald-100",
        select: "bg-emerald-50 text-emerald-900 border-emerald-300 focus:ring-emerald-200",
    },
    Cancelled: {
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-800 border-rose-200/80 ring-rose-100",
        select: "bg-rose-50 text-rose-900 border-rose-300 focus:ring-rose-200",
    },
    Returned: {
        dot: "bg-orange-500",
        badge: "bg-orange-50 text-orange-800 border-orange-200/80 ring-orange-100",
        select: "bg-orange-50 text-orange-900 border-orange-300 focus:ring-orange-200",
    },
};

export const PRIORITY = {
    Low: {
        dot: "bg-slate-400",
        badge: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-100",
        select: "bg-slate-50 text-slate-800 border-slate-200 focus:ring-slate-200",
    },
    Medium: {
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-100",
        select: "bg-amber-50 text-amber-900 border-amber-200 focus:ring-amber-200",
    },
    High: {
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-800 border-rose-200 ring-rose-100",
        select: "bg-rose-50 text-rose-900 border-rose-200 focus:ring-rose-200",
    },
};

export function getTicketStatusStyle(status) {
    return TICKET_STATUS[status] || TICKET_STATUS.Closed;
}

export function getOrderStatusStyle(status) {
    return ORDER_STATUS[status] || ORDER_STATUS.Pending;
}

export function getPriorityStyle(priority) {
    return PRIORITY[priority] || PRIORITY.Medium;
}

export const TICKET_STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];
