function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function toDateInputValue(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatDayLabel(date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(date) {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function getPresetRange(preset) {
    const today = startOfDay(new Date());

    if (preset === "week") {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return { start, end: today };
    }

    if (preset === "month") {
        const start = new Date(today);
        start.setDate(start.getDate() - 27);
        return { start, end: today };
    }

    if (preset === "year") {
        const start = new Date(today.getFullYear(), 0, 1);
        return { start, end: today };
    }

    return { start: today, end: today };
}

export function parseDateRange(startStr, endStr) {
    const start = startOfDay(new Date(startStr));
    const end = endOfDay(new Date(endStr));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    if (end < start) return null;
    return { start, end };
}

export function buildRevenueChart(orders, start, end) {
    const startDate = startOfDay(start);
    const endDate = endOfDay(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / 86400000) + 1;

    const inRange = (orders || []).filter((o) => {
        const d = new Date(o.createdAt);
        return d >= startDate && d <= endDate;
    });

    if (diffDays <= 14) {
        const labels = [];
        const data = [];

        for (let i = 0; i < diffDays; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            labels.push(formatDayLabel(day));

            const total = inRange
                .filter((o) => startOfDay(new Date(o.createdAt)).getTime() === day.getTime())
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            data.push(total);
        }

        return { data, labels, total: data.reduce((a, b) => a + b, 0) };
    }

    if (diffDays <= 90) {
        const weekCount = Math.ceil(diffDays / 7);
        const labels = [];
        const data = [];

        for (let w = 0; w < weekCount; w++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(weekStart.getDate() + w * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

            labels.push(
                w === weekCount - 1
                    ? "This Week"
                    : formatDayLabel(weekStart)
            );

            const total = inRange
                .filter((o) => {
                    const d = new Date(o.createdAt);
                    return d >= weekStart && d <= weekEnd;
                })
                .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            data.push(total);
        }

        return { data, labels, total: data.reduce((a, b) => a + b, 0) };
    }

    const labels = [];
    const data = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (cursor <= endMonth) {
        labels.push(formatMonthLabel(cursor));

        const monthStart = new Date(cursor);
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
        const bucketStart = monthStart < startDate ? startDate : monthStart;
        const bucketEnd = monthEnd > endDate ? endDate : monthEnd;

        const total = inRange
            .filter((o) => {
                const d = new Date(o.createdAt);
                return d >= bucketStart && d <= bucketEnd;
            })
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        data.push(total);

        cursor.setMonth(cursor.getMonth() + 1);
    }

    return { data, labels, total: data.reduce((a, b) => a + b, 0) };
}

export { toDateInputValue, startOfDay, endOfDay };
