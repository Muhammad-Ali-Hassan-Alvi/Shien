export function formatNotificationDateTime(dateInput) {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function groupNotificationsByTime(notifications) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const groups = {
        Today: [],
        Yesterday: [],
        "This Week": [],
        Older: [],
    };

    for (const notification of notifications) {
        const date = new Date(notification.createdAt);
        if (Number.isNaN(date.getTime())) {
            groups.Older.push(notification);
            continue;
        }
        if (date >= startOfToday) groups.Today.push(notification);
        else if (date >= startOfYesterday) groups.Yesterday.push(notification);
        else if (date >= startOfWeek) groups["This Week"].push(notification);
        else groups.Older.push(notification);
    }

    return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export const NOTIFICATION_TYPE_LABELS = {
    NewOrder: "New Order",
    OrderPlaced: "Order Placed",
    OrderUpdate: "Order Update",
    Sale: "Sale",
    LowStock: "Low Stock",
    OutOfStock: "Out of Stock",
    QuestionReply: "Q&A Reply",
    NewQuestion: "New Question",
    HelpCenter: "Help Center",
    Review: "Review",
    Newsletter: "Newsletter",
    Registration: "Registration",
};
